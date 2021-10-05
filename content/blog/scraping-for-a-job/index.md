---
title: "How to Crawl the Web with Scrapy"
description: "How to use the python web scraping framework Scrapy to crawl indeed.com. Learn data engineering strategies for getting actionable insights from public information."
category: "Tutorial"
date: "2021-09-13T19:00:00.00Z"
---

Web scraping is the process of downloading data from a public website. For example, you could scrape ESPN for stats of baseball players and build a model to predict a team's odds of winning based on their players stats and win rates. Below are a few use-cases for web scraping.

* Monitoring the prices of your competitors for price matching (competitive pricing).  
* Collecting statistics from various websites to create a dashboard e.g. COVID-19 dashboards.
* Monitoring financial forums and twitter to calculate sentiment for specific assets.

One use-case I will demonstrate is scraping the website indeed.com for job postings. Let's say you are looking for a job but you are overwhelmed with the number of listings. You could set up a process to scrape indeed every day. Then you can write a script to automatically apply to the postings that meet certain criteria. 

*Disclaimer: Web scraping indeed is in violation of their terms of use. This article is meant for educational purposes **only**. Before scraping a website be sure to read their terms of service and follow the guidelines of their robots.txt.*

## Data warehousing Considerations 

Our spider will crawl all the pages available for a given search query every day, so we expect to store a lot of duplicates. If a post is up for multiple days then we will have a duplicate for each day the post is up. In order to be tolerant of duplication we will design a pipeline that captures everything then filters the data to create a normalized data model we can use for analysis.

First the data will be parsed from the web page then put into a semi-structured data structure, like JSON. From here the data structure will be stored in an object store (e.g. S3, GS). An object store is a useful starting place for the capture of our data. It is cheap, scaleable, and can change flexibly with our data model. Once the data is in our object store the work of the web scraper is done, and data has been captured. 

The next step is to denormalize the data into something more useful for analysis. As previously mentioned the data contains duplicates. I would choose to use a SQL database because it has powerful analytical queries. It will also give me the ability to separate different entities, like companies, job postings, and locations. First all posts will go into a fact table (large write only table) with a timestamp showing when the posting was scraped, and when it was inserted into the table. From here we can de-normalize the data into a stateful table representing currently active postings. 

A merge statement could be written to update and insert posting into our table representing live postings. From here we will also want to delete postings that have been deleted or have expired. Now we have a table that has been normalized, or in other words all the duplicates have been removed. 

## Setting up the Project

For this project I will be using [Scrapy](https://docs.scrapy.org/en/latest/index.html), because it comes with useful features and abstractions that will save you time and effort. For example, scrapy makes it easy to push your structured data into an object store like S3 or GCS. This is done by adding your credentials along with the bucket name and path to the configuration files generated by scrapy. The purpose is for long term storage and to have an immutable copy generated each time we run our scraper. Because S3 is a limitless object store, it is the perfect place for long term storage that will scale easily with any project. 

To highlight a few more features, scrapy uses the Twisted framework for asynchronous web requests. This means the program can do work as it is waiting for the website server to respond to a request, instead of wasting time by waiting idly. Scrapy has an active community, so you can ask for help and look at examples from other projects. It also provides some more advanced options like running in a cluster with Redis, and user-agent spoofing but those are outside the scope of this tutorial. 

Let’s start by creating a virtual environment in python and installing the dependencies. Then initializing a blank project where we will have our web crawlers. Be sure to execute this code in the top level directory of your project.

```bash
python3 -m venv venv 
source ./venv/bin/activate 
pip install scrapy lxml BeautifulSoup4 jupyterlab pandas
scrapy startproject jobs
cd jobs/jobs/
scrapy genspider indeed indeed.com
```

The code for parsing the web page will go in the file `indeed.py` in the `spiders/` directory. A spider is an abstraction of a web crawler that generates HTTP requests and parses the page that is returned. There is a separate abstraction for processing and storage of the information called an ItemPipeline. Separation of such abstractions allow for decoupling, flexibility, and horizontal scaling. For example, You could send the result of the spider to multiple places without modifying the internal logic of the spider’s code. A good practice would be to save the results as a file in an object store for long term storage, and in a database for deduping and adhoc querying. 

## Development Environment

You can think of web scraping as reverse engineering other people’s work. There are many tools available to make web development more composable and manageable, such as the use of reusable templates or ES6 modules. These allow a web developer to reuse the same code in multiple places with the goal to combine simple pieces into something more complex.  When you are scraping a website all you have is the actual rendered web page, we don’t have access to components that were used to build that page. So we have to work backwards using any tricks we can to get what we want. 

The very first step of any web scraping project is to open the page you want to scrape in your web browser and explore the DOM with the “Inspect Element” in your browser of choice. Using the developer tools in your browser you can explore the structure of the DOM, or the skeleton of the page. Feel free to [open the page](https://www.indeed.com/q-medical-assistant-l-Boston,-MA-jobs.html) now and explore it with developer tools. Throughout the process we will be using the browser to quickly navigate across the dom, in a visual and interactive way. 

I like to develop the parsing code for my web scraping using the scrapy shell with iPython, the interactivity allows for quick feedback loops, allowing for lots of trial and error. The scrapy shell drops you into the scrapy context with all of the helpers and convenience functions already instantiated. These same objects are available to the spider during runtime. It also gives you access to all the features of iPython. You can start your shell with the code below.

```bash
scrapy shell 'https://www.indeed.com/q-medical-assistant-l-Boston,-MA-jobs.html'
```

The most important object here is the response. This contains the HTTP response from the web server to our HTTP GET request. It contains the HTML of the page, as well headers and other information associated with the HTTP response. The basic feedback loop is using the browser to identify what we want to parse, then testing that parsing code in the terminal. 

## Starting URLs

If you look at the link above, you may notice the URL contains our search query. This is how parameters are passed in HTTP GET requests (this example does not use the [standardized format](https://en.wikipedia.org/wiki/Query_string)). We can utilize this information to programmatically try different search queries.

In the url, following the letter q we see our query which corresponds with the job title. After the letter l is the location. Let's say in our use case we want to search for multiple locations and job titles. For example, medical assistants are also called patient care assistants.

In scrapy we can pass our spider several urls as starting points for scraping. We can pass it URLs that correspond with multiple locations and job titles to get this behavior. In this example I use the product function to generate every combination of location and job title, then I pass it to the spider as our starting point.

```python
from itertools import product

job_titles = ["Medical Assistant", "Patient Care Technician", "Patient Care Assistant"] 
states = ["MA"]
cities = ["Boston", "Cambridge", "Somerville", "Dorchester"]
urls = []
for (job_title, state, city) in product(job_titles, states, cities):
     urls.append(f"https://www.indeed.com/q-{'-'.join(job_title.split())}-l-{city},-{state}-jobs.html")

class IndeedSpider(scrapy.Spider):
    name = "indeed"
    allowed_domains = ["indeed.com"]
    start_urls = urls
```

Maybe you noticed that searching the same job title in adjacent cities would yield overlapping results. In other words, searching for the same title in Cambridge and Boston will return duplicates. One major challenge of any data project is deduplication. One strategy we could use is to have an application cache like redis, our program could check if a listing has already been parsed based on a natural primary key made up of its job title, company name, location, and posting date. We could even look for a unique ID in the DOM generated by the server. For simplicity, we will do deduplication at the very end once everything has been saved to our object store.

## Parsing the Page

I will be using the python library `BeautifulSoup4`to parse the HTML because this is the library I am the most familiar with. By default, scrapy comes with CSS selectors and XPath selectors, both are powerful ways to write queries against the DOM. For this tutorial, you will need to import beautiful soup into our shell then parse the HTML into a BeautifulSoup object. I like BeautifulSoup because of the simplicity of the find API. 

```python
from bs4 import BeautifulSoup
soup = BeautifulSoup(response.text, features="lxml")
```
Please note that this parsing code will become broken when they rename their CSS classes. If you are finding that the examples are not working, then try fixing them to work with how the website is structured and named today. 

To begin we will need to find a way to parse a list of all the jobs on a given page. We want to find a way to capture the top level node of each listing. Once we have the parent node of each listing we can then iterate on how to parse the attributes of each individual listing. Currently, each listing has a top level anchor element (`<a>`) with `class="tapItem"`. We can use the CSS class to select all of these nodes that represent individual listings. 

```python
listings = soup.find_all("a", {"class": "tapItem"})
```

In this tutorial we will target the attributes job title, employer, location, and job description. The first three attributes can be found in the search results page, while the job description will require following a link to the job descriptions page. Starting with the attributes available on this page we can use the CSS class to target different attributes of the listing within each parent node.

```python
for listing in listings:
    job_title = listing.find("h2", {"class": "jobTitle"}).get_text().strip()
    summary = listing.find("div", {"class": "job-snippet"}).get_text().strip()    # strip newlines
    company = listing.find("span", {"class": "companyName"}).get_text().strip()
    location = listing.find("div", {"class": "companyLocation"}).get_text().strip()
```

I wrote this code by finding the job title in the inspect element devtools then iterating on the code in iPython. In each case I found that selecting by HTML element and CSS class was sufficient to get the information I needed. 

Now we need to retrieve the job description located on a separate page. To do this we will send another HTTP request to retrieve the page with the job description on it using the link we found on the search results page. We get the link url by combining the relative path found in the href of the anchor tag with the URL of the search results page found in our response object. Then we will ask scrapy to schedule the request with the asynchronous event loop. 

We will be combining the job description (jd) with information we found on this page page, so we will pass the parsed attributes to the callback function so they can all be stored in the same item. Scrapy requires using the yield statement because functions are executed by an asynchronous scheduler. The `parse_jd` callback function will return a dictionary representing the job listing. 

```python
posting = {"job_title": job_title, "summary": summary, "company": company, "location": location}
jd_page = listing.get("href")
if jd_page is not None:
    yield response.follow(jd_page, callback=self.parse_jd, cb_kwargs=posting)
```

Now all that’s left to do is parse the job description and then yield the item for collection. Luckily for us the job description has a unique id. This is the easiest way to select a specific element. We want to save the URL for the job description, because if we end up applying we’ll need the link to find the apply button. 

``` python
def parse_jd(self, response, **posting):
    soup = BeautifulSoup(response.text, features="lxml")
    jd = soup.find("div", {"id": "jobDescriptionText"}).get_text()
    url = response.url
    posting.update({"job_description": jd, "url": url}) 
    yield posting
```

Parsing is typically the most challenging and time consuming phase of writing a spider. Websites will change over time, so you will need to modify the code when it breaks. It can be useful to add a validation step that checks for `None` or empty strings, then raises an error. This way you get notified when the code is no longer working. This should only be done for critical path information, as missing information can be common.

The final step is to tell our scraper to go to the next page of the search results. We want the crawler to retrieve every post currently available, not just results on the first page. When the next page button is no longer available then we will know that we’re done.

```python
next_page = soup.find("a", {"aria-label":  "Next"}).get("href")
if next_page is not None:
    next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)
```
With these simple sets of instructions we now have a fairly robust process for extracting all the important details. The ability to follow the next page link means the crawler will scrape all the available results without any additional coding. Now we are done writing the spider and we can move on to the results.

## Saving the Results

Now that the parser is written we can start utilizing some scrapy features. We have an option to use an `ItemPipline` to send each `Item` into a file object store or a database. We could utilize a highly available distributed database with a high write throughput (e.g. DynamoDB, Cassandra), and insert the items into a table as it’s running. 

For this project I will use the builtin feeds option to create extracts from the command line. I would choose JSON lines because the JSON encoder will properly escape newline characters and quotes as part of the process of marshalling into JSON. This could save you some pain later on compared to CSV, where a single extra newline character or quotation mark can lead to parsing errors and headaches. Also a semi-structured format is useful when the schema is not static, each item may vary in what attributes it contains. 

There is a way to specify the feed in a config file, but I will show you how to do it from the command line. We will create a JSON Lines file containing all the scraped data to our local filesystem. From there we can start interacting with the results to extract value. 

```bash
scrapy crawl indeed -o jobs.jl
```

This will take some time to run depending on how many jobs titles and locations you have configured. All websites have some form of rate limiting. The rate limiting can be implemented by the CDN like Cloudflare, or by a load balancer/reverse proxy. Rate limiting prevents Denial of Service (DoS) attacks from taking down a web server. Scrapy will perform an exponential backoff until it gets a 200 response code, this means it will wait a little longer after each failure until a request is successful. 

## Analyzing the Results

Now that we have a file containing all of the postings we can begin our analysis. One way to do analysis is to use Jupyter notebooks. Jupyter notebooks are useful for exploratory data analysis and nonlinear programming. When we are coding for the purpose of discovery and analysis we don’t know what the end state looks like. As we are writing code we will need to change the order of things, and make big changes, that’s why it’s called nonlinear programming. Jupyter makes this style of programming easier.

Jupyter notebooks facilitate this type of development by utilizing cells and iPython. By using iPython as it’s backend, it allows you to work in a REPL environment. A REPL allows you to quickly be able to see the output of the code you executed and hold onto objects after they are created. The second piece is cells which can be moved, cut, copied, and deleted. Cells make it simple to change the order of execution, and change the scope of objects.  I found the notebooks a good place to develop my analysis of the results.

## Conclusion

The next step would be to aggregate and normalize the data, analyze it, then create some sort of user interface for accessing it. For example you could have a website that displays all the scraped websites sorted and filtered on custom criteria. You could use keyword detection to prioritize the listings that offer the opportunities you are most interested in.

Using scrapy to write a spider will get you past the first step, parsing data from a web page and saving it. This is the first component in any data pipeline that relies on data from web crawling. Once you have captured the data you can then start extracting value from it for whatever application you wish.

You can download a python file with [all the code](./indeed.py) from this tutorial.