---
author: Tom Webb
excerpt: Proposed new OBIS visualisation of marine species richness, gaps and completeness.
  Using Belgium as a test case.
feed: true
identifier: OBIS-completeness
lang: en
layout: post
purpose: news
tags:
- biodiversity
- data products
title: Visualisation of biodiversity richness, gaps and completeness
---

Current OBIS visualisations of richness and completeness have been extended using a new method to refine estimates of completeness. Previously, the well established richness and completeness measure Chao2 had been applied across all OBIS data (All biota and fishes) within an area (grid square or other geographic region) of interest (see [OBIS summary maps](/indicators/completeness/)). This is problematic because Chao2 assumes equal detectability of all species, but the different surveys accumulated within OBIS will have targeted different taxonomic and functional groups, in different places and at different times. For instance, fish trawl surveys provide no information about cetacean richness, and so using only fish trawl surveys as a basis for total richness and completeness estimates is inappropriate.

Our approach to partially overcome this problem has been to calculate Chao2 separately for different groups defined on the basis of organisms that tend to be surveyed at the same time using comparable methods. Some such groups are based on taxonomy (e.g. seabirds, marine mammals) whereas others are functional groups (e.g. phytoplankton, benthos). To define these non-taxonomic groups we take advantage of the newly compiled biological traits database within WoRMS ([http://www.marinespecies.org/traits/](http://www.marinespecies.org/traits/)), which has so far assigned >141,000 marine species to a functional group. These data cannot yet be accessed via web services (although this is planned) and so we used an offline version of the functional group database. As a proof of concept, we accessed all species-level OBIS records from the Belgian EEZ, matched these to the WoRMS functional groups and our defined taxonomic groups, and calculated Chao2 for each group. Code is available on [GitHub](https://github.com/iobis/dataproducts/tree/master/completeness).

The results shown here (figure 1) highlight some issues with the approach, notably that not all species are yet assigned to functional groups, the groups themselves may need to be refined (e.g. separating macrobenthos from meiobenthos, or infauna from epifauna), and OBIS records with no sample date are not useful for calculating Chao2 and so must be discarded (resulting in significant numbers of bird and mammal records - and recorded species - being absent from these calculations). However, the resulting Chao2 estimates should be more robust than the previous single estimate across all taxa. Replicating this approach over space will allow maps of estimated richness and completeness (recorded richness / estimated richness) to be created for each individual group, and summed across groups.

<img src="/images/cumulative_species_group_year.png" width=""/>

Figure 1. Chao2 estimates of diversity (orange lines; orange band gives lower and upper bounds) for each of seven major taxonomic or functional groups within the Belgian EEZ. Also shown are numbers of unique species recorded in every year since 1903 (grey bars), and cumulative number of species recorded in each group (blue line).


**We welcome suggestions for furhter enhancements to this product through our [GitHub repository](https://github.com/iobis/dataproducts/tree/master/completeness) or by email to info@iobis.org**

---
This post was supported by the [DIPS-4-Ocean Assessments project](http://www.iode.org/index.php?option=com_content&view=article&id=470&Itemid=100216), funded through the Flanders UNESCO Science Trust Fund, which aims to develop biodiversity indices based on OBIS to support global assessments on the state of the marine environment.

<img src="/images/flanders_logo.jpg" width=""/>

---