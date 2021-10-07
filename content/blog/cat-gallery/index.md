---
title: "Add Images to Gatsby Blog"
description: "How to use S3 as a headless CMS to add photos to a Gatsby Blog that uses Markdown and gatsby-image."
date: "2021-10-15T16:20:00.00Z"
category: "Tutorial"
---

![Found sleeping in the shade of a vestibule on a lazy afternoon.](./white-cat.jpg)

When I created this blog I ran into a issue. I wanted to store my blog posts as plain text markdown files in Github. But I also wanted to have large high resolution images. It is not advisable to store large binary data types like jpegs in git. The object gets copied on each commit. Over time images would increase the size of the repo until operations like git clone would run slowly, making the repo frustrating to work with.

I set out to find a way to add images to Gatsby starter blog template in a low friction way. I did not want use a CMS, that felt like overkill. I find they provide more features than I need, and the abstraction is not useful for a personal blog where I am the only contributor.

Most gatsby plugins built for a CMS assume that the CMS defines the blog posts completely and the website simply renders what is returned by the CMS. WI wanted a mixture of markdown combined with photos stored in an object store.

## Benefits of Markdown

![Hanging out on a sturdy trellis supporting a fig tree.](./white-cat-on-trellis.jpg)

There are several advantages to using markdown. It is interoperable, and not tied to a specific platform. The use of markdown has been a main stay in static blogging websites going back to some of the earliest blogs on the web. I also wanted my articles to be readable from Github without going to the website at all. It also allows people to contribute to blog via a pull request.

Having the articles in Github gives me a sense of ownership. Since Github will likely remain free forever it feels like a safe bet. While a CMS could hide your data behind a pay wall one day once they decide to eliminate their free tier.

## Gatsby Image

![](./cat-with-eye-infection.jpg)

A requirement I gave was that I wanted to use the `gatsby-image` library. Because it offers great features like lazy loading, blurry image placeholder, image resizing and optimization. The library only works if the files are present at build time. This rules out the use of a CMS because these work by requesting the image after the website has been built.

The solution I came up with was to store the images in S3 and download them to the local file system in the `prebuild` npm script hook. This way the images are present at build time but are not in Git itself.

## Implementation

![](./cat-big-eyes.jpg)

I decided to write [a script in python](https://github.com/mbass171/babbling.fish/blob/master/get_photos.py) to pull images into the repo during build time. I choose python because it is installed by default in Ubuntu 20.04, the docker image I am using to build this website. The script is simple and pulls down images and puts them into a directory that matches their key prefix in S3.

In `package.json` you can create "pre" scripts. For example, if you create a script named `prebuild` it will automatically get executed before the `build` script. I placed the script here so it would run before build.

```js
  "scripts": {
    "prebuild": "python3 get_photos.py",
    "build": "GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES=true gatsby build --log-pages",
    "predevelop": "python3 get_photos.py",
    "develop": "gatsby develop",
  }
```

## Deployment to CDN

I am using Netlify as the CDN for this blog. The caching of python libraries is done automatically when it detects a `requirements.txt` file. It also automatically caches all of the gatsby artifacts in the `.cache` created during build time.

I want to add the ability to cache these photos so they don't need to be downloaded from S3 on every build. I have not yet figured out how to do this. The size of the blog currently is small and the transfer fees cost cents to do. The images get served up by the CDN itself, so I only pay for the transfer cost between S3 and Netlify. Netlify is hosted in AWS so this download is incredibly fast, as it can utilize the AWS wired ethernet connection.
