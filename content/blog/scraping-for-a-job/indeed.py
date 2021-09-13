from bs4 import BeautifulSoup
from itertools import product
import scrapy

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

    def parse_jd(self, response, **posting):
        soup = BeautifulSoup(response.text, features="lxml")
        jd = soup.find("div", {"id": "jobDescriptionText"}).get_text()
        url = response.url
        posting.update({"job_description": jd, "url": url}) 
        yield posting

    def parse(self, response):
        soup = BeautifulSoup(response.text, features="lxml")

        listings = soup.find_all("a", {"class": "tapItem"})
        for listing in listings:
            job_title = listing.find("h2", {"class": "jobTitle"}).get_text().strip()
            summary = listing.find("div", {"class": "job-snippet"}).get_text().strip()    # strip newlines
            company = listing.find("span", {"class": "companyName"}).get_text().strip()
            location = listing.find("div", {"class": "companyLocation"}).get_text().strip()

            posting = {"job_title": job_title, "summary": summary, "company": company, "location": location}
            jd_page = listing.get("href")
            if jd_page is not None:
                yield response.follow(jd_page, callback=self.parse_jd, cb_kwargs=posting)


        next_page = soup.find("a", {"aria-label":  "Next"}).get("href")
        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)
