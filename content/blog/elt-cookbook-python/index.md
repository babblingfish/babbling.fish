---
title: "Python for Distributed Systems"
description: "Common design patterns used by data engineers to write python scripts that can be horizontally scaled on a stateless task runner."
date: "2021-09-04T16:20:00.00Z"
category: "Reference"
---

When writing data workflows to be horizontally scaleable it is important to make scripts idempotent. Idempotency means that a script can be run multiple times without side effects or dependencies. When you run the same script with the same input you should always get the same result. If a function changes the input, relies on a stateful variable then it is not idempotent.

The assumption allows code to be executed inside a stateless distributed workflow executor like Apache Airlfow or Luigi. Inside these environments the same code is executed across multiple machines in parallel with different input.

Idempotency also makes DevOps easier beacuse your team members know they can safely run any workflow without having to know what it does. This abstraction lets other engineers know that a worfklow can be rerun and it will not impact other workflows. The dependencies should encapsulated in the relationships between the tasks in the directed acyclic graph (DAG) itself.

Here are some common patterns useful for working with data pipelines and distributed systems in an idempotent way. The overall theme is that scripts need to be idempotent because they **will** fail, and backfilling data requires running multiple instances at the same to avoid things taking too long.

## Loading Files into the Database

One common operation done in scripting is to load a file into the database. When loading the file it has to be temporarily stored inside the computer's memory or storage inside a buffer. It's important to use buffers in an idempotent way. It also means the script does not produce side effects, like mutating its input or locking a globally used file.

One common gotcha is to use a hardcoded file path as a buffer. This will result in issues if multiple processes try reading or writing to the same file at once.

Below is an example, this script downloads a file from s3 to a file named `transaction.csv`, then copies that file into the database, and finally deletes it. If two processes try to write to this file at the same time that could result in duplication. Even worse, if one process deletes the file before the other has finished writing, then we could have data loss!

### Don't

```python
import boto3
import os
import psycopg2

# Download file from S3 to be copied into database
s3 = boto3.client("s3")
s3.download_file("BUCKET_NAME", "OBJECT_NAME", "transaction.csv") # highlight-line

conn = psycopg2.connect("host=localhost dbname=postgres user=postgres")
cur = conn.cursor()
with open("transaction.csv", "r") as f:
    next(f)  # skip headers line
    cur.copy_from(f, transaction, sep=",")
conn.commit()
os.remove("transaction.csv") # highlight-line
```

Instead use a temporary file or an in-memory string or bytes buffer. An in-memory buffer can work if the amount of data is small or the machine has a lot of memory. For the in-memory buffer you can use the builtin `io.StringIO` object for storing the unicode string in memory, or `io.Bytes` for storing encoded binary data.

Using a temporary file is a more generalizable solution since files can get as large as the file system allows. For very large files this method is impractical and too slow, so you will need to find a way to keep your file size low.

The `tempfile` library allows for the creation of temporary directories and files with globally unique tables, on POSIX systems this works by utilizing the `/tmp` directory and grabbing a random string from `/dev/urandom`. Using `tempfile` with a context manager will automatically dereference the file to be garbage collected by the OS when you are done.

### Do

```python {diff}
import boto3
import psycopg2
import tempfile

s3 = boto3.client("s3")
conn = psycopg2.connect("host=localhost dbname=postgres user=postgres")
cur = conn.cursor()
- s3.download_file("BUCKET_NAME", "OBJECT_NAME", "transaction.csv")
+ with tempfile.NamedTemporaryFile(mode="wb") as f:
+ # or
+ # with io.BytesIO() as f:
+    s3.download_file("BUCKET_NAME", "OBJECT_NAME", f.name)
+    f.seek(0)
+    cur.copy_from(f, transaction, sep=",")
 conn.commit()
- os.remove("transaction.csv")
```

Both methods support context managers (the `with` closures) so the memory / storage gets freed up automatically.

## Using transactions

When executing SQL queries from python, it's important not to leave the database in a partial or incomplete state. One way of accomplishing this is to wrap your queries inside of a transaction then only commit the transaction at the end. This guarantees that the database will only be updated once the script is complete.

### Don't

```python
conn = psycopg2.connect("host=localhost dbname=postgres user=postgres")
cur = conn.cursor()
cur.execute("DELETE FROM transaction WHERE created_at = '2019-02-12'")
conn.commit()
cur.execute("INSERT INTO transaction WHERE created_at = '2019-02-12 SELECT * FROM loading'")
conn.commit()
```

This script uses a `DELETE` and `INSERT` pattern to de-duplicate data. If the script were to fail after the `DELETE` before the `INSERT` the database would be left in a bad state with missing data.

### Do

```python {diff}
conn = psycopg2.connect("host=localhost dbname=postgres user=postgres")
with conn.cursor() as cur:
    cur.execute("DELETE FROM transaction WHERE created_at = '2019-02-12'")
    cur.execute("INSERT INTO transaction WHERE created_at = '2019-02-12 SELECT * FROM loading'")
    conn.commit()
```

By commiting at the end we know that the table will not be missing any data.

## Functional Programming

When writing code that transforms data it is important to use the concept of "pure" functions from functional programming. A pure function is one that can execute without mutating its input or creating side effects. And of course a pure function is idempotent and always returns the same value for the same input. In practice this means creating a new object to return to the calling function rather than mutating an object passed as input.

As a side note, mutating state in a database is by definition not something that can be done in a 100% repeatable way. Since the goal is to change the state permanently to the current state. When the state changes in the future we will get a different result. Functional programming is meant to be used for changing the state of an application in a safe way, or transforming data in a repeatable way. In web development there is often a file named `utils.js` with pure functions that can be used to transform data in a safe way.

### Don't

```python
def min_max_scale(s: list):
    min_val = min(s)
    max_val = max(s)
    for i in range(len(s)):
        s[i] = (s[i] - min_val) / (max_val - min_val)
    return s
```

The input list is being modified by the function. If the list is referenced elsewhere in the program this can cause unintended issues.

### Do

```python {diff}
def min_max_scale(s: list):
    min_val = min(s)
    max_val = max(s)
    new_series = []
    for i in range(len(s)):
-        s[i] = (s[i] - min_val) / (max_val - min_val)
+        new_series = (s[i] - min_val) / (max_val - min_val)
    return s
```

Also, any resources used to complete the action need to be safely closed. One additional note is to avoid modifying global state variables. If a function references a global variable it should be in a read-only context.

## Conclusion

The theme throughout these examples is to write code that won't produce side effects. Running code in an environment like Apache Airflow makes the assumption that the code is stateless. In other words it will run from a clean worker machine without any previous memory of the task. Any state should be stored in a database for long term storage. The program should also be able to run in parallel with different parameters. As this is the requirement for running a backfill.

These strategies have the added benefit of being resilient for failure. You should always work under the assumption that things will fail. Having an ability to recover from a failure and fill in missing data is critical to build a redundant and resilient system.
