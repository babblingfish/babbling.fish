---
title: Vertica Survival Guide
date: "2019-12-26T22:12:03.284Z"
description: "A guide to using Vertica for data warehousing and ETL, for people who already know SQL."
category: "Reference"
image: ./run-length-encoding.png
---

Vertica is a distributed database used for data warehousing and analytics. In order to properly design tables and queries it’s important to understand the key features. This is by no means comprehensive, I’d recommend checking out the official Vertica documentation for a more technical viewpoint.  The goal is to provide an intuitive understanding of first principles to allow a programmer familiar with SQL to get cracking.

## Vertical Storage

Records are stored in columnar order in Verica, rather than row order like OLTP databses e.g. MySQL, PostgreSQL. This allows for massively parrallel processing, as well as highly encodable and compressible data. Vertical storage is the key to understanding query optimization in Vertica. It is also the common feature among most major data wharehouse technologies like BigQuery and RedShift.

## Massively Parallel Processing

Vertica is designed to run in a cluster of nodes. The nodes have a shared nothing architecture meaning each node has its own hardware resources and the nodes communicate over the internet. Being distributed also makes it highly available and scalable, with the ability to add or subtract nodes. When designed correctly, the workload of a query is evenly spread across nodes creating ridiculous performance gains. When nodes have to communicate with each other this shows up as a `BROADCAST` in the query plan, I will refer to it as shuffling.

Vertica is designed to do fact table to dimension table joins. The dimension tables are replicated across each node, so that joins can be done onto them locally on each node. When designed correctly, Vertica will perform a join locally on each node then collate the responses at the end.

## Projections

In Vertica Projections are what is stored in the physical storage layer. They are analogous to tables in other SQL databases, with similar features (strongly typed columns, uniqueness constraints). A projection can contain a set of columns from multiple tables like a materialized view. Every projection stores a separate copy of the data. One projection can contain a subset of another projection, but with a different segmentation and sorting order.

Every table has a super projection containing all the columns of a logical table. You can create a projection optimized for a specific query. Projections offer high availability via buddy projections which are copies of the same projection, but the columns are stored on different nodes. Since every projection stores a complete copy of the data, mutating a projection will result in all of the buddy projections and derivative projections being mutated as well. Bad performance on delete operations has the potential to slow down the whole cluster through cascading projections.

## Segmentation

Segmentation is where the data is stored. For large tables, the goal is to evenly distribute the data across the cluster for parallel query execution to avoid shuffling. This is done by using a hash key on a unique identifier like a user_id, a hash key can contain multiple columns. If records need to be shuffled between nodes for a join you will see `GLOBAL RESEGMENT GROUPS` in the query plan. This is a hint that segmentation is a possible way to improve performance.

For small dimension tables you want it to be replicated across all nodes. To do this you mark the table as `UNSEGMENTED ALL NODES` this will create a copy of the table in each node in the cluster. This will allow the each node to load the table into memory for quick hash joins. 

```sql
-- fact table of transactions
CREATE TABLE transactions (
    transaction_id INT NOT NULL,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    vendor VARCHAR(255) NOT NULL,
    dollar_amount NUMERIC  NOT NULL,
    execution_timestamp TIMESTAMPTZ
) -- sort columns are ordered by cardinality and based on user queries
  ORDER BY vendor, product_id, user_id -- highlight-line
  SEGMENTED BY HASH(user_id) ALL NODES -- highlight-line
;

-- dimension table containing information about products
CREATE TABLE products (
   product_id INT NOT NULL,
   product_type INT NOT NULL,
   product_description VARCHAR(1000) NOT NULL
) ORDER BY product_type, product_id  -- highlight-line
  UNSEGMENTED ALL NODES              -- highlight-line
; 
```

## Sorting and Cardinality

The sort order determines how the data is stored on disk. This is the primary way query performance is optimized. The order by clause determines the sort order. The goal is to use columns that get used in join, where, and group by clauses. Using a sort column in a join allows a merge join, a special optimized type of join that works by using two pointers on two sorted lists. When used correctly with segmentation a merge join allows records to be quickly joined on a node without any shuffling.

One of the ways this works is by Run Length Encoding on low cardinality columns. Run Length Encoding (RLE) works by sorting the data then taking the counts of each value. Rather than storing each individual value it sorts the values then stores the counts for each unique value.  When you include a column with RLE in the where clause Vertica will do a predicate push down and only access the values you want excluding the rest. This is similar to how an index works in typical databases. When used in a where clause it allows the query optimizer to scan only a fraction of the rows, making the query more selective and much faster.

![Run Length Encoding](./run-length-encoding.png)

When a column with RLE is used in a group by clause, assuming there aren’t too many groups, then the optimizer can process each group more quickly. Because the data for a single group are colocated in the same block of memory since they contain the same value in the RLE. This allows Vertica to do a consecutive read on the records it needs rather than jumping between blocks.

Storing data in a columnar fashion makes it more compressible since the columns all have the same data type, where as a row contains a variety of different data types. An advantage of encoding is that data does not have to be decoded to be processed, the smaller footprint of decoded data helps reduce IO. On the other hand, data needs to be decompressed in order to be processed.

## Conclusion

Keeping the techniques mentioned here in mind is useful for speeding up the performance of any slow query. I have seen improvements of 5x to 20x speedups just by adding segmentation or changing the sort order. A good rule of thumb is that nothing should ever be that slow. Unless you are trying to do a fact table to fact table join. Joins between fact tables will be slow in Vertica since they always require a lot of shuffling. If something is running really slowly it’s likely there are some opportunities to improve it. If these don’t help then you need to first diagnose if the query is being memory bound, CPU bound, or IO bound.
