---
author: Ward Appeltans
excerpt: OBIS is not only point data, it also handles line transects and polygons
feed: true
identifier: OBIS-lines
lang: en
layout: post
purpose: news
tags:
- database
title: Line transects and polygons
---

There is often a misconception that OBIS is only about point data. Below is a nice example of a dataset from OBIS Canada with almost 10,000 line transects over a 50-year period ([go to the dataset page on OBIS](https://obis.org/dataset/5061d21c-6161-4ea2-a8d4-38f8285dfc47)). OBIS has always allowed start-end coordinates and bounding boxes in the past. With the new DarwinCore standard these location features (including more complicated line strings and polygons!) are stored in DwC: [footprintWKT](http://rs.tdwg.org/dwc/terms/index.htm#footprintWKT).
 
Some examples of WKT strings from the [OBIS manual](https://obis.org/manual/darwincore/#location):
 
LINESTRING (30 10, 10 30, 40 40)  
POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))  
MULTILINESTRING ((10 10, 20 20, 10 40),(40 40, 30 30, 40 20, 30 10))  
MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)),((15 5, 40 10, 10 20, 5 10, 15 5)))
 
Note there is a WKT mapping tool at [http://obis.org/maptool](http://obis.org/maptool).

![line-strings-2833.png](/images/line-strings-2833.png)