---
title: "SQL for Distributed Systems"
description: "Common design patterns used by data engineers in SQL and Python, for ELT scripting in distributed computing environments."
date: "2021-09-30T16:20:00.00Z"
category: "Reference"
---

Writing SQL for the purpose of data aggregation and reporting requires a separate mindset than writing SQL for the backend of a web application. For a web application we typically are updating a specific user's records. In data warehousing application we need to think of ways to efficiently backfill our data and run our SQL quickly at scale.

A backfill is when we want to populate data in a table for the past X days. To do so our SQL has to be repeatable and horizontally scaleable. We need to populate data for multiple days at a time in a way that does not leak data or result in duplication. Below are a few tips to achieve this goal.

## Templates

Template libraries in python were originally developed for the purpose of web development as a way to generate static HTML content on the server side. Static content can be cheaply hosted on CDNs using fast web servers like NGINX. Templates are very useful for generating SQL because they allow for parameterization and embedding python logic inside a SQL script.

A common pattern in data warehousing is to parametrise a date for a given script. We are typically processing yesterday's data for today's report. Using a template, we can make it so yesterday's date is dynamically generated in python based on the day we would like the report for.

Templating is also useful when you need to use an imperative programming language for tricky logic. For example, if you need to do complicated time zone conversions you can do so in python and write the code into the template itself. Having the python inside a template with a SQL extension allows your IDE to use SQL syntax highlighting, facilitates separation of concerns, and makes the database logic more discoverable using file search.

It will be tempting to embed the SQL into your application code. The issue is that the engineer has to read through all the application code to understand how it interacts with the database. The whole advantage of using SQL is that it is an abstraction, decoupled from the application that can be reasoned about independently. Some of my favorite SQL features are that it has interoperability across levels of the organization (including analysts, product team, data engineers, data scientists), and is declarative in nature. By embedding it you lose some of its strongest features.

### Don’t

```SQL
-- PostgreSQL
SELECT *
   FROM transaction
WHERE transaction_time
BETWEEN DATE(NOW() AT TIMEZONE 'America/New_York')
          AND DATE(NOW() AT TIMEZONE 'America/New_York' - INTERVAL ‘1 DAY’);
```

The problem with using the now stored function is that the script can only be used to process data relative to the current moment. A backfill is when we want to reprocess data in the past. Code written using a stored function to get the current time cannot be used to do a backfill without manually changing the script.

Let's say we define a python function `convert_to_eastern` that takes a timestamp and converts it to the eastern time zone. We pass this function to the render funcion of our template library so that it is available inside the template.

### Do

```SQL {diff}
/* PostgreSQL with Jinja2 templating from Apache Airflow */

SELECT *
   FROM transaction
 WHERE transaction_time
- BETWEEN DATE(NOW() AT TIMEZONE 'America/New_York')
-          AND DATE(NOW() AT TIMEZONE 'America/New_York' - INTERVAL ‘1 DAY’);
+  BETWEEN ‘{{ convert_to_eastern(execution_date.date().isoformat()) }}’
+         AND  ‘{{ convert_to_eastern(execution_date - macros.timedelta(days=1)).isoformat() }}’
```

Using templated SQL we can define the execution_date as a parameter. Doing a backfill would then consist of running the same task iteratively with all the dates from some point in the past to today via task scheduler like Apache Airflow.

## Prefer Overwriting

This lesson is somewhat counterintuitive, the primary purpose of a SQL database is to store stateful information about users or a business. It is natural then to think update statements are a good way to change the state for a given record. The problem with updates is that they are poorly optimized in data warehouses that are designed for high throughput reads and writes.

This is because the database uses immutable data structures under the hood for performance reasons. For example a database could be using compressions and encoding of strongly typed columns to achieve some of its performance gains. An update is often implemented as a delete and then insert, and too many delete operations can really hurt performance. Since a record is not stored contiguously in a column oriented database, a delete will touch several different blocks of memory to delete a single row.

When writing SQL for data warehousing it’s preferable to overwrite partitions then to upsert (in general there are exceptions of course). This has the benefit of simplifying some operations and being really fast in many cases. Let's say we want to backfill for some previous days. We have written our code to insert rows into a table with the assumption that the rows are not already in the table. This method helps us avoid rewriting our insert as an update and insert, and writing additional deduplication logic. If we simply overwrite the existing partition we can reuse our insert statement knowing the data already there will simply be removed.

Let’s say we have a table in Postgres partitioned on a datetime column. If we write our code to overwrite the partition then the SQL logic is the same every time regardless if we are backfilling or not. When we run the code again it will just blow away what’s already there and replace it with what we want.

### Don't

```SQL
-- hiveSQL
UPDATE transaction
SET
      amount = loading.amount,
      transaction_time = loading.transaction_time
FROM loading
WHERE transaction.id = loading.id;

INSERT INTO transaction
SELECT * FROM loading
WHERE (transaction_id) NOT IN (SELECT DISTINCT transaction_id FROM transaction);
```

In the above query first we update the records if they already exist in the target table, then we insert records that do not exist. We may also need a third step to delete any records that could have been produced as duplicates.

### Do

```SQL
-- hiveSQL
INSERT OVERWRITE TABLE transaction
PARTITION (transaction_time=transaction_time)
SELECT * FROM loading;
```

Another reason overwriting partitions is fast is because the old partition gets deallocated from memory instantly without an actual disk write. Meaning this will only take as long as writing the new data to disk, the old data does not impact performance.

## Intermediate tables

It is often useful to use intermediate tables when writing SQL, especially in data warehouses that use columnar storage to achieve fast write speeds. One benefit is that it allows you to break your query into smaller more manageable pieces, making the SQL easier to read and reason about. The other benefit is performance, when you have the data you want to work with in an intermediate table you can add an index (or sort order and partitioning) to fit the subsequent joins and queries to optimize performance.

When using intermediate tables you should create a local temporary table scoped to your database session. This will prevent issues from running the same query in parallel across different processes with different arguments. Another reason to avoid using the same table is to avoid exclusive (X) locks when performing deletes and updates that can slow down performance or even cause deadlock.

### Don’t

```SQL
TRUNCATE intermediate_table;
INSERT INTO intermediate_table SELECT * FROM table
```

It will be tempting to use a permanent table as an intermediate, then to truncate and insert into it. The problem is this method does not scale to distributed systems and can lead to weird behavior if two processes are writing to the same table. One process could truncate the table immediately after a different process inserts into the same table. In a distributed system you want processes to be isolated from each other so they can safely run in parallel.

### Do

```SQL
-- postgreSQL
CREATE TEMP TABLE intermediate_table AS SELECT * FROM table;
```

## Conclusion

This article went over a few tips to developing SQL for data warehouses that gets executed by a task runner in a cluster of workers. There are many other techniques that are dependent on the specific database vendor. The most optimal way to develop your SQL will depend on which database vendor you are using.
