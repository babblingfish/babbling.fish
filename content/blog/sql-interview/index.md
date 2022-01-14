---
title: "Preparing for the SQL Interview"
description: "In this tutorial you will learn how to prepare for the data engineering SQL interview."
category: "Tutorial"
date: "2022-01-14T16:20:00.00Z"
---

![Wild California Poppy](./wildflower.jpg)

When applying to be a data engineer at a big company, you will likely need to pass a SQL test. I'd like to take what I've learned and share it with prospective candidates. If you feel stuck on a question you can cycle through this list in your mind to find ideas on how to proceed.

You should already know some basic SQL. If you don't there are a lot of high quality tutorials out there. I took the [SQL tutorial on codeacademy](https://www.codecademy.com/learn/learn-sql) ages ago, and I thought it was pretty good. 

## General tips 

You should use PostgreSQL (PG) to practice for your interview. PG is an open source database with a very robust feature set. Also, it is the only SQL dialect supported on Coderpad. Coderpad is used by several large companies e.g. Google, Meta, Amazon. 

It is easy to spin up your own PG instance using docker or installing directly to your machine via homebrew or apt. It mostly uses standard SQL, the universal core spec of the SQL programming language. It also has support for analytical functions which are important for more difficult questions.

It's good to know some basics about query optimization in PG. For example, you should know that common table expressions ([CTEs](https://www.postgresqltutorial.com/postgresql-cte/)) are implemented as temporary tables. This is an easy way to get a performance boost by using intermediate tables.

## The Problem

Let's use a [leetcode problem](https://leetcode.com/problems/department-top-three-salaries/) as an example. Take some time to try and solve this on your own. 

The question is to find the cancellation rate for each day between 2013-10-01 and 2013-10-03, but only counting trips when the driver and the user are not banned. Here is the schema from the linked problem for reference. 

```
Trips
+-------------+----------+
| Column Name | Type     |
+-------------+----------+
| id          | int      |
| client_id   | int      |
| driver_id   | int      |
| city_id     | int      |
| status      | enum     |
| request_at  | date     |     
+-------------+----------+
id is the primary key for this table.
The table holds all taxi trips. Each trip has a unique id, while client_id and driver_id are foreign keys to the users_id at the Users table.
Status is an ENUM type of ('completed', 'cancelled_by_driver', 'cancelled_by_client').

Users
+-------------+----------+
| Column Name | Type     |
+-------------+----------+
| user_id     | int      |
| banned      | enum     |
| role        | enum     |
+-------------+----------+
user_id is the primary key for this table.
The table holds all users. Each user has a unique user_id, and role is an ENUM type of ('client', 'driver', 'partner').
banned is an ENUM type of ('Yes', 'No').
```

*This problem has been copied from LeetCode for educational purposes only. This website is not monetized in any form.*

## Avoid Many-to-Many Joins

Writing SQL is really all about normalization. Every table needs to have a column or set of columns that makes a record unique. Without this we would have no way to know if duplicates exist. 

Duplicates can easily be introduced by accident through a many-to-many join. A many-to-many join will take the cartesian product between the two sets, quickly multiplying the size of the result set.

When you perform a join between two tables using a column that is not normalized, the resulting set will contain duplicates. As an initial step you'll need to normalize your data before performing the joins using CTEs. This is basically true for every SQL question I encountered.

Let's take a look at the example problem. A naive approach would be to do a self-join on the trips table joining on the `request_at` column. Doing so would result in a many-to-many join as several records in the table can have the same `request_at`. 

To answer this question we will need to create two CTEs: one for the number of canceled trips, and another for the total trips. These CTEs will need to be normalized first before you can join them together.

```SQL
WITH canceled AS (
   SELECT t.request_at, count(*) `cancelled_count`
     FROM Trips t
    INNER JOIN Users c ON t.client_id = c.users_id
    INNER JOIN Users d ON t.driver_id = d.users_id
    WHERE c.banned = 'No' AND d.banned = 'No' AND t.status IN (2,3)
    GROUP BY t.request_at -- highlight-line
), total_trips AS (
   SELECT t.request_at, count(*) `total_count`
     FROM Trips t
    INNER JOIN Users c ON t.client_id = c.user_id
    INNER JOIN Users d ON t.driver_id = d.user_id
    WHERE c.banned = 'No' AND d.banned = 'No'
    GROUP BY t.request_at -- highlight-line
)
```

Here is an example on how to create two CTEs to normalize on the `request_at` column. Now we can join these two CTEs together with a a one-to-one join. 


## Know how to handle NULLs

![A visual description of null. Most SQL Dialects do not have an undefined field.](./toilet_paper_meme.jpg) 

Anyone who has worked with SQL knows that NULL is a tricky concept. I was frequently asked to demonstrate that I understand how to handle null values appropriately in my interviews.

When comparing NULL you need to use the IS operator because NULL is a singleton (NULL is NULL returns true). NULL is not equal to NULL (NULL = NULL would return false). When you do arithmetic with a number and a NULL then you will get a NULL result since they are not comparable. For this reason, you must use the IFNULL function to convert NULL into zero before using it in arithmetic.

At the same time you have to avoid divide by zero errors. If you try to divide by zero that will throw an error. If you divide by NULL that will make the result NULL, which is what we want.

Here we look at how we will calculate the cancellation rate based on the two CTEs above. 

```SQL 
SELECT
    tt.request_at AS `Day`, 
    ROUND(
        IFNULL(c.cancelled_count,0) / 
        IF(tt.total_count=0,NULL,tt.total_count), 
        2) AS `Cancellation Rate`
FROM
total_trips tt
LEFT OUTER JOIN canceled c ON tt.request_at = c.request_at
WHERE tt.request_at >="2013-10-01" AND tt.request_at <= "2013-10-03";
```

When you are performing an outer join, we can expect to see some null values in our result set. In this query the `cancelled_count` or the `total_count` could be null. By wrapping them in an `IFNULL` statement and setting them to 0, we avoid having our ratios converted to NULL inapropriately.

Let's say we want to join between the trips and users table. But there are users in the trips table that are not in the users table, as well as the converse. We don't want to have user_id  columns in our result set as that will make downstream processing more complicated. So what we can do is use a `COALESCE` statement so we can find the first non-null values across both columns. The `COALESCE` function can take many arguments so this can be done across multiple columns.

```SQL
SELECT DISTINCT COALESCE(users.user_id, trips.client_id)
  FROM trips
  FULL OUTER JOIN users 
      ON trips.client_id = users.user_id
```

## Know how to use Having with Group By

This is an easy one so be sure to know it. A common followup question for a query involving a `GROUP BY` is to ask a question that requires adding a `HAVING` clause. Let's say we modify our problem to return the cancellation rate only for days that have more than X canceled trips. To do this we could add a `HAVING` clause to filter out days with less than X canceled trips.

```SQL
WITH canceled AS (
  SELECT t.request_at, count(*) `cancelled_count`
    FROM
    Trips t
    INNER JOIN Users c ON t.client_id = c.users_id
    INNER JOIN Users d ON t.driver_id = d.users_id
    WHERE c.banned = 'No' AND d.banned = 'No' AND t.status IN (2,3)
    GROUP BY t.request_at
    HAVING COUNT(*) > 10000 -- highlight-line
)
```

## How to use Row Number to get the Kth Item

Whenever you see them asking for the kth ordered item, you should instantly think of [ROW_NUMBER](https://www.postgresqltutorial.com/postgresql-row_number/). Similarly you may need to use [Rank](https://www.postgresqltutorial.com/postgresql-rank-function/), but this is less common because it is harder to use. With Rank you can end up having multiple rows with the same ranking and that makes the code more complex.

If you learn only one analytical function, make it this one. Let's say we want the driver with the fifth most completed trips.

```SQL
WITH trips AS (
 SELECT driver_id, COUNT(1) as num_trips
   FROM trips
  WHERE status = 'completed'
)
 SELECT driver_id 
   FROM (
         SELECT driver_id,
                ROW_NUMBER() OVER 
                (PARTITION BY driver_id ORDER BY num_trips DESC) as row_num
           FROM trips ) T
  WHERE T.row_num = 5
```

This query will only return the driver the fifth most trips. There are other analytical functions that are useful, so be sure to read up on some of the others. Some functions are easier to write questions for than others so keep that in mind when you decide how much effort to put into studying each.
