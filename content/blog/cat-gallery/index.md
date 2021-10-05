---
title: "Add Images to Gatsby Blog"
description: "How to use S3 as a headless CMS to add photos to a Gatsby Blog."
date: "2021-10-15T16:20:00.00Z"
category: "Tutorial"
---

![cutie](./white-cat-on-trellis.jpg)

When I created this blog I ran into a issue. I wanted to store my blog posts as plain text markdown files in Github. But I also wanted to have large high resolution images. It is not advisable to store large binary data types like files in git. The object gets copied on each commit. Images would result in the size of the repo getting large and over time very slow, and frustrating to use.

I wanted to use markdown because of it's interoperability. I also wanted my articles to be readable from Github without going to the website at all.

Also, I wanted to use the `gatsby-image` library. Because it offers great features like lazy loading, blurry placeholder, image resizing and optimization. The library only works if the files are present at build time. This rules out the use of a CMS because these work by requesting the image after the website has been built.

The solution I came up with was to store the images in S3 and download them to the local file system in the `prebuild` npm script hook. This way the images are present at build time but are not in Git itself. 

# Implementation

I decided to write the script in python because it is installed by default in Ubuntu 20.04, the docker image I am using to build this website. The script is simple and pulls down images and puts them into a directory that matches their key prefix in S3. The tricky part was getting Netlify to cache the results. Without caching this could potentially sow down biulds a lot in the furture.

![cutie](./cat-twins.jpg)

