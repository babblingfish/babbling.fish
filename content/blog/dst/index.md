---
title: "Daylight Savings Time"
description: "How daylight savings time has been ruining my life and will ruin yours one day."
category: "How-to"
date: "2022-03-27T16:20:00.00Z"
---

With the senate passing [a bill](https://www.reuters.com/world/us/us-senate-approves-bill-that-would-make-daylight-savings-time-permanent-2023-2022-03-15/), the US has finally decided to make daylight savings time (DST) permanent in 2023 (pending approval by congress and the president). 

![](mars.jpg)

While all programmers work with time, the work of a Data Engineer especially involves working with timestamps in the database. Some tasks commonly done by data engineers include reporting, logging, and tracking the arrival time of events.

I am going to talk about some of the work that will be involved in the transition. Also, I will discuss strategies that I have seen used to handle time changes for scheduling and reporting.

## Goodbye Backwards Compatibility

It is considered best practice to store timestamps in UTC format in the database. One benefit is that the UTC time zone does not have DST changes.

If you stored your timestamps in a local timezone like Pacific Time (e.g. America/Los_Angeles) then permanent DST will break your backwards compatibility. All of the timestamps that are stored in PST are no longer valid. As PST will no longer exist as a valid time zone. If you wanted to map them to the present day equivalent you would need to add one hour and change the timezone info.

Committing such a change would be a major pain. The timestamp would likely be spread out across several different tables and stored in files inside an object store like S3. Changing the value everywhere without breaking anything would be near-impossible. 

The only thing that makes sense to me would be to gradually age out the old data. A team could migrate to UTC this year and start collecting records with clean timestamps. Then they can set a retention policy and delete the old data with the dirty timestamps. Hopefully they can do this before the execution of the change in 2023.

## Goodbye Scheduling Pain

In our current system, the twice-a-year hour change causes issues with scheduling and orchestration. As an example, let's take a popular open source workflow management tool for scheduling like Apache Airflow. Airflow runs on UTC time, and uses UTC timestamps exclusively in its data model. 

We often have reports that are meant to be delivered by a specific time in a local time zone. For example, we want to see a summary of yesterday's performance at 0800 PT. The job that delivers the report is being run at a specific time in UTC. So when there is an hour change, the report is now running at the wrong time.

There are two solutions to this problem, the simple solution is to manually change the `schedule_interval` twice a year. Move it up one hour in March, and back one hour in November. Another solution is to write a script to change the schedules automatically. This solution ends up being surprisingly time consuming. 

There is a similar problem when it comes to running scripts that aggregate data from the previous calendar day. It is common to run reporting scripts at around midnight for a local US time zone. Because we want to process yesterday's data for reporting as soon as yesterday is over. Since reporting is typically grouped by calendar day.

What makes this scenario more complicated than the above is these aggregation scripts have several upstream and downstream dependencies. A single change to scheduling can have a chain reaction causing other scripts to change their time as well.

![](days_since.jpg) 

## Hello Job Security

In all reality this problem will be easy to fix for most companies that are using servers connected to the public internet and running the latest version of their open source software. For example, running `apt upgrade` would patch all the software to include the new timezone information. 

Somewhere out there is old enterprise software with datetime libraries that were developed in-house back in the 80s or 90s. Doing a major version update on a forty year old software library may require a total rewrite of the code itself. 

Such a task would need to be done by specialists with a very strong understanding of the code. Surely some COBOL programmers who have been kept on retainer will be happy to hear about this change.

## Conclusion

The fact that the US decided to go with DST permanently is a somewhat existential problem. For much of human history, solar noon has been defined as the time of day when the sun is highest in the sky based on a sundial. Now we are saying that noon is actually one hour after solar noon. 

Just kidding, all times are made up so who cares. I definitely prefer DST because it gives me more daylight hours after I finish working for the day. I also noticed more people in my neighborhood walking outside at times that would have been dark before DST. 

While there will be work involved in the transition, in the long run this should reduce work for programmers. The bi-annual time change has always been a risk that creates unnecessary issues and complexity. 

![](praise_the_sun.jpg)
