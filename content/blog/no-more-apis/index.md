---
title: "The Enshitification of APIs"
description: "Why Twitter and Reddit are increasing the cost to use their APIs."
category: "Explanation"
date: "2022-08-20T16:20:00.00Z"
---

![A Snowy Owl missing its left eye, North Island Wildlife Recovery Centre, Errington, BC](./snowy_owl.jpg)

With the rising popularity of large language models (LLMs), the value of natural language text is increasing. Recently Reddit, following the example set by Twitter (aka X), decided to dramatically increase the price of using their APIs. To the point where using it at scale would be astronomically expensive and totally infeasible. (An API is a programmatic way to access information, in this case it refers to accessing data with a RESTful HTTP request without a web browswer.)

The goal of the API pricing change is to reduce access to this data and squeeze the large corporate customers who are willing to pay up. The natural progression of [enshitification](https://pluralistic.net/2023/01/21/potemkin-ai/#hey-guys) continues, where companies begin by offering customers value in order to onboard them. And then they gradually increase monetization and degrading the user experience. In other words, they are making their websites worse on purpose in order to increase sales.

> I call this [enshitification](https://pluralistic.net/2023/01/21/potemkin-ai/#hey-guys), and it is a seemingly inevitable consequence arising from the combination of the ease of changing how a platform allocates value, combined with the nature of a "two sided market," where a platform sits between buyers and sellers, holding each hostage to the other, raking off an ever-larger share of the value that passes between them.

Not a shocking or new development, but something that will have an impact on the open source community. 
Now it will be impossinle for academics and independent teams to download all the natural text data from these sites for training LLMs in a cheap or conveinent way. And once again data will continue to become a resource centralized and concentrated by a few powerful corporations.

If LLMs are going to be as successful as everyone hopes they will be, then a very important question will be: with what data was it trained? The internet is a big place and there are a lot of niche communities, will they all be represented? With the goal to create a more equitable model then it will be imperative to start with a dataset that is carefully curated to remove hateful speech, misinformation, and conspiracy theories. But will also need to be as broad and diverse as possible to capture the entire probability space of language.

Twitter and Reddit are without a doubt the largest repositories of natural language that exist on the internet today. Users submitted their text for the benfit of other users, not to enrich corporations and increase their data from competition. 

This leaves only one recourse: web scraping. The only way academics and individual contributors can get access to this data would be using a combination of browsers running on forward proxies to get this data without the API. Since web scraping is a violation of the terms of service for these websites, the data cannot be shared openly and easily between contributors. The scale of the data will also make hosting expensive and impractical for the open source community. It leaves little hope that the data will remain available for those outside the corporations that pay for it.

