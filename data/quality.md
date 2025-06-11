---
identifier: quality
lang: en
layout: page
shorttitle: Quality control
title: Quality control
---

# Quality control

Quality control is essential to ensure the reliability and trustability of the marine biodiversity datasets published on OBIS. Thanks to a transparent and comprehensive quality control process, all datasets published on OBIS are standardized, traceable, and transparent, follow the FAIR and CARE principles and provide visible attribution and ownership. OBIS's rigorous quality control also ensures various data providers, from highly specialized national marine institutions to local citizen-science initiatives, can contribute to the platform with the same level of reliability.

Trust in data is vital. The combined efforts of the OBIS community in quality control ensure that users, from researchers to decision-makers, journalists and educators, can work with our data confidently. The OBIS quality control process is divided into a series of three main steps—initial, automated and manual—to detect and flag potential issues.

## **1- Initial formatting and Darwin Core compliance**  
OBIS, like other major global biodiversity data initiatives, has adopted Darwin Core as its primary standard, ensuring common data structure and vocabularies. This initial formatting includes scientific names, location (latitude and longitude), date, depth, and source metadata.

## **2\. Manual Curation by OBIS Nodes**  
OBIS is, first and foremost, a community structured to transform potential contributors into actual data providers. Regional and thematic OBIS Nodes review, support the submission process and collaborate closely with the data providers to help them resolve their potential data issues and improve the quality of their submissions.

## **3\. Automated quality control steps with OBIS-QC**  
OBIS QC is a custom, in-house validation tool that applies quality control checks to any dataset published on the platform. Control points include geolocation checks (e.g., coordinates on land, invalid ranges), date validation (e.g., future dates, missing or partial information), depth checks (e.g., depth values on land or negative depths), taxonomic validation (e.g., misspelt or outdated species names), precision checks targeted at coordinates and measurements. Datasets that fail to pass a checkpoint are flagged but not deleted so that users can filter them out and providers can fix them. You can read more about the OBIS flagging process [here](https://manual.obis.org/dataquality.html){target="_blank"}.

## **4\. Automated taxonomic verification**  
OBIS is tightly integrated with the [World Register of Marine Species](https://www.marinespecies.org/){target="_blank"} (WoRMS, hosted and maintained by VLIZ, the Flanders Marine Institute) to ensure that all species names are validated against an authoritative taxonomy. Records referring to non-marine species are automatically flagged. Full taxon classification is appended to the datasets based on the WoRMs database matching.

## **5\. Automated enrichment and Harmonization**  
For each dataset published on OBIS, additional metadata, such as EEZs (Exclusive Economic Zones), marine regions, and habitats, are added using standardized references (e.g., Marine Regions) to provide additional geographical and ecological context.

## **6\. Indexing and Publication**  
Once datasets pass quality checks and manual curation, they are indexed into the OBIS database and made directly accessible on [obis.org](https://obis.org/). Each dataset is accompanied by its metadata and quality control flags, allowing users to assess its reliability for their specific use case.