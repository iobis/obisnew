---
author: Samuel Bosch
excerpt: Bosch et al. (2017) showed that while temperature is a relevant predictor
  of global marine species distributions, considerable variation in predictor relevance
  is linked to the species distribution modelling (SDM) set-up. A standardized benchmark
  dataset (MarineSPEED) was created by combining records from OBIS and GBIF with environmental
  data from Bio-ORACLE and MARSPEC. Using this dataset, predictor relevance was analysed
  under different variations of SDMs for all combinations of predictors from eight
  correlation groups.
feed: true
identifier: marinespeed
image: marinespeed_freq_top_5_ranks.png
lang: en
layout: post
link: http://dx.doi.org/10.1111/ddi.12668
purpose: usecase
tags:
- species distribution modelling
- predictor selection
- OBIS data
title: Identifying relevant predictors for marine species distribution modelling with
  MarineSPEED
---

<p>Climatological conditions are currently changing at an unprecedented rate and anthropogenic activities displace species out of their native area across the globe. Both processes have the potential to alter biological communities and reduce ecosystem services. Knowing under which environmental conditions species may maintain or establish viable populations therefore is more critical than ever. Species distributions are increasingly modelled for conservation and ecological purposes. A better understanding of mechanisms shap- ing species distributions allows for more accurate predictions of future distributions of species in a rapidly changing world.</p>

<p>Thanks to the availability of an increasing number of online distribution records (e.g., OBIS, GBIF), pre-processed environmental data layers (e.g., WorldClim, Climond, Bio-ORACLE, MARSPEC) and modelling algorithms accessible through various statistical packages, SDM has become a widely applied technique in ecology and conservation biology.</p>

<p>Altough the importance for SDM of selecting biologically relevant predictors, and its impact on model uncertainty and transferability has been highlighted by several studies, to date no comprehensive study on the relevance of the predictors of marine species distributions across taxa has been performed.</p>

<p>In this study, Bosch et al. (2017) created the Marine SPEcies with Environmental
Data (MarineSPEED) dataset and used it to: (1) identify the most relevant predictors of marine species distributions and (2) identify which parts of the SDM process impact the relevance of predictors the most.</p>

<p>For MarineSPEED, we selected well-studied and identifiable species from all major marine taxonomic groups. Distribution records were compiled from public sources (e.g., OBIS, GBIF, Reef Life Survey) and linked to environmental data from Bio-ORACLE and MARSPEC. Using this dataset, predictor relevance was analysed under different variations of modelling algorithms, numbers of predictor variables, cross-validation strategies, sampling bias mitigation methods, evaluation methods and ranking methods. SDMs for all combinations of predictors from eight correlation groups were fitted and ranked, from which the top five predictors were selected as the most relevant.</p>

<p>We collected two million distribution records from 514 species across 18 phyla. Mean sea surface temperature and calcite are, respectively, the most relevant and irrelevant predictors. A less clear pattern was derived from the other predictors. The biggest differences in predictor relevance were induced by varying the number of predictors, the modelling algorithm and the sample selection bias correction. The distribution data and associated environmental data are made available through the R package <em><a href="https://cran.r-project.org/package=marinespeed">marinespeed</a></em> and at <a href="http://marinespeed.org">http://marinespeed.org</a>.</p>

<p>Full reference:
<ul>
<li>Bosch S., Tyberghein L., Deneudt K., Hernandez F., & De Clerck O. (2018) In search of relevant predictors for marine species distribution modelling using the MarineSPEED benchmark dataset. Diversity and Distributions, 24. <a href="http://dx.doi.org/10.1111/ddi.12668">http://dx.doi.org/10.1111/ddi.12668</a></li>
</ul>
</p>