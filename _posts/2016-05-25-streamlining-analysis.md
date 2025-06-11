---
author: Tom Webb and Alun Jones
excerpt: OBIS is the largest global repository of marine biodiversity data. As such,
  there is considerable interest among the research community in using OBIS data for
  large scale macroecological and biogeographic analyses. This is reflected in the
  number of citations of OBIS in the scientific literature.
identifier: streamlining
lang: en
layout: post
purpose: news
tags:
- data analysis
title: Streamlining and enriching the analysis of OBIS data using R
---

OBIS is the largest global repository of marine biodiversity data. As such, there is considerable interest among the research community in using OBIS data for large scale macroecological and biogeographic analyses. This is reflected in the number of citations of OBIS in the scientific literature. To pick on one very recent, high profile example, OBIS data were integral to Woolley et al.’s demonstration that diversity in deep sea brittle stars is driven by energy availability.

When compiling datasets for this kind of analysis, researchers will typically interact with OBIS via the web portal. Certainly we have done this in the past, although I have also collaborated more directly with OBIS data managers, and for intensive projects such as Alun’s PhD, we have remotely accessed the back-end PostgreSQL OBIS database. These methods are all adequate, but they are not always entirely transparent or repeatable, can be labour intensive (both on the part of researchers and the OBIS team), and require all researchers to find their own solution afresh.

In addition, OBIS data are usually just the starting point for a more detailed analysis of species occurrences or biodiversity patterns over space or through time. Very often, we wish to enrich basic occurrence data with information from other sources, usually relating either to the taxa in question (e.g. more detailed taxonomic or biological data), or the environment in which they occur (including for example physical structure, climatology, and productivity), or both. Again, researchers have generally found their own solutions to these issues - in the brittle star paper linked to above, for example, occurrence records were linked to global datasets of bathymetry, sea-floor temperature, and Net Primary Productivity, among other environmental variables. Based on discussions with numerous colleagues, however, these steps - linking and enriching spatial datasets - are frequently considered challenging and time consuming, and because specific methods adopted by individual researchers are not always described in sufficient detail to be exactly replicated, wheels are often re-invented.

A final common operation is to crop OBIS and/or environmental data to a study region of interest. 
Many such regions are defined at marineregions, which also provides downloadable geometries. It is already possible to incorporate some of these into analyses (see diagram), but combining different spatial data formats, including points (e.g. occurrences), grids (e.g. environmental data) and polygons (e.g. political or biogeographic regions) remains a significant challenge to many ecological researchers.

Our intention as part of the DIPS 4 Ocean Assessments project is to streamline this generic workflow, using the widely adopted statistical computing environment R to make programmatic access to OBIS data straightforward, and to facilitate a number of common operations such as those mentioned above. Building on progress made within the OBIS secretariat - in particular, Pieter Provoost’s robis package - and during a hack event held in December 2015, involving various experts including Scott Chamberlain from rOpenSci, we will provide tools and tutorials to help researchers interested in the following broad classes of questions:

1. Where does my study species occur?
2. Which species occur in my study area?
3. What are the environmental conditions within my study area, or experienced by my study species?

These simple questions are a starting point to much more general questions - for example, generalising (1) to a list of species, and then linking this with (3), allows for the analysis of community patterns of environmental tolerances; defining the study area in (2) as a cell on a spatial grid, and then iterating across cells, allows for gridded estimates of diversity, and so on. Given that OBIS occurrence data, and many spatial environmental layers, are time-stamped, tracking patterns in taxon-level occupancy or region-level diversity through time, as well as temporal relationships between diversity and environment, is also possible. Developing the statistical methodology to infer robust temporal relationships is the subject of Alun’s PhD, and while such analyses are not straightforward, we will be able to provide illustrative examples and some guidelines for best practice.

The diagram below illustrates some of the example workflows that we think are most commonly required by biodiversity scientists, and indicates existing R packages or code in development that enables researchers to simply, openly, and reproducibly navigate through certain common pathways. By including examples of different kinds of spatial data, we hope that this framework will be easily extendible to incorporate a wide range of different datasets of potential natural and anthropogenic drivers of diversity. We welcome suggestions and feature requests.

<img src="/images/analysis.png" class="img-responsive"/>