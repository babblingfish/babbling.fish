---
title: "The Data Problem for Startups"
description: "The difficult problem of relying on application data transfer as a startup."
date: "2021-12-07T16:20:00.00Z"
category: "Explanation"
---

![Muir Beach Coast Trail, Marin County CA](./foggy-trail.jpg)

The hard pill to swallow for many startup founders is that getting data from a business is expensive and time consuming. Oftentimes engineers are searching for ways to speed up the process with automation and standard operating procedures. These help to an extent but fundamentally they cannot scale without also scaling the number of employees.

## The Problem

Let's say we have a company that does analytical modeling for insurance companies. In order to perform their analysis, the startup needs to move the client's data from their database into the startup's database.

This process is painful and error-prone. The client may be using an IBM mainframe from the 1980s and can only export the data as fixed character length files once a day at 2 AM when the load is lowest. Another client may be able to send you files over an object store in a more reasonable format like Parquet. Even so, as you start to work with this customer's data  you'll find they have made small, yet extremely important, differences in the way they represent their data.

I am very skeptical of these startups that rely on business data and assume they can onboard hundreds of small clients. The idea is that if process of on boarding clients is cheap and quick enough, the startup can quickly scale up.

The most obvious problem is that clients do not have the same data models. Once they send the data over someone on the startup side then has to do the boring work of mapping everything from the client's schema to the startup's schema. This is where small difference become big. Say one client represents refunds as a negative transaction, while another uses positive numbers but identifies it as a refund with a flag. Someone has to write business logic to transform the clients data into a normalized format that is consistent with other clients.

Landing one big client is not the silver bullet answer either. Since that one client is going to expect premium treatment given how much they are spending. They were probably promised the moon by the sales team and the engineering team is going to be constantly working to push new features to them. The large client will have unique problems for their scale of data transfer that won't generalize to other smaller companies or even other large companies.

## How did we get here?

So why is this the case? The developers who designed the database for the business application did not have this use-case in mind. They are thinking of data access patterns to support fast single row transactions. Maybe this requires a heavy amount of normalization. When it comes time to pull this data out, it requires someone with deep institutional knowledge of the data model to write queries to pull out the relevant data.

Even then sending the data is a pain as well. Most companies do not have a way to send many small files in parallel, a method of data transfer that is fast and uses less memory. Instead they will send big files with each file corresponding to a given query for a given day.

The companies that rely on data that can scale easily are ones that are consumer facing and generate their data with machines. This data is oftentimes produced by client devices logging user interactions with application.

It is much more difficult for startups that rely on getting their data from other businesses. Especially when those businesses are not tech companies. These kind of companies tend to have small IT teams and don't have the necessary staff and expertise to create a low friction hand-off of the data.

## Conclusion

Sure they'll be able to get faster and take on more clients. But scaling will always be linear. If they want to on board more clients that means more engineers and more solution engineers. They will never achieve the sort of parabolic growth they are hoping for.

I'd love to be proven wrong, can anyone provide me with an example of a startup that managed to scale this way?
