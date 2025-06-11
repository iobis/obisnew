---
author: John Nicholls and Georgia Sarafidou - OBIS HDMT Chairs
excerpt: The Ocean Biodiversity Information System (OBIS) is a global repository for
  all types of marine biodiversity data, including invaluable historical, archaeological
  and paleontological data.
feed: true
identifier: obis-historical-data-project
image: /images/obis-hdmt-thumb.jpg
lang: en
layout: post
purpose: news
tags:
- OBIS HDMT
- Historical data
title: 'Historians, Archaeologists and Paleontologists: OBIS, a leading global marine
  biodiversity database welcomes your time-series data'
---

<figure style="float: left; margin-right: 20px;">

<img src="/images/obis-hdmt.jpg" alt="Main figure"/>

</figure>

The Ocean Biodiversity Information System (OBIS) is a global repository for all types of marine biodiversity data, including invaluable historical, archaeological and paleontological data. 

OBIS recognizes the difficulties in formatting such data. This kind of data is sometimes seen as "specialist" or "niche" when it comes to sharing in globally accepted databases that are accessible and recognised in academic, research and scientific forums.

Some of the nuances associated with historical data have to do with the change in calendar systems, from the [Julian calendar](https://en.wikipedia.org/wiki/Julian_calendar) to the currently used (by most countries) [Gregorian calendar](https://en.wikipedia.org/wiki/Gregorian_calendar) metric system. This change was implemented in 1582, so any datasets with data representing periods that predate this year **must** be checked and converted to the standard Gregorian calendar system. Additionally, there is [no year zero](https://en.wikipedia.org/wiki/Year_zero), only -1 and 1, where -1 is BCE (Before Common Era) and 1 is CE (Common Era). This can make interpretation of historical dates more challenging as such dates will need to be converted to align with ISO 8601 standards.

To accommodate such challenges the OBIS Historical Data Project Team recommends the following:

- Always populate `verbatimEventDate` with the originally documented date so that it can be preserved. Place converted dates that align to ISO 8601 in the `eventDate` field, and document the changes you made to the original in `eventRemarks`.
- When the exact date is unknown, provide a date range, e.g. the period 21 November 1521 to 29 August 1612 records as 1521-11-21/1612-08-29.
- For archaeological data, use terms from the [Darwin Core class GeologicalContext](https://dwc.tdwg.org/terms/#geologicalcontext) and/or the [Chronometric Age Extension](https://tdwg.github.io/chrono/). GeologicalContext terms can be used to capture information such as periods or ages, however the Chronometric Age extension allows for more thorough descriptions of the time period and can link to the Event core table. For such records, `eventDate` would be populated with the date of collection.
- If the historical record contains uncertain or sensitive location information, generalize the location information using polygons or lines as described in this Manual.

For historical data originating from old records, such as ship logs or other archival records, we understand there can be a variety of issues in interpreting and formatting data according to DwC standards. 

If you need further help with historical data formatting, we recommend [submitting a Github issue](https://github.com/iobis/obis-issues/issues), or contacting the OBIS-OPI node who focuses on [Oceans Past](https://oceanspast.org/) historical, archaeological, and paleontological data series.

**Contact:** OBIS HDMT Chairs: John Nicholls ([john.nicholls@tcd.ie](mailto:john.nicholls@tcd.ie)) and Georgia Sarafidou ([g.sarafidou@hcmr.gr](mailto:g.sarafidou@hcmr.gr))

<p style='color: lightgrey; font-style: italic;'>Post image: Chris Light, CC BY-SA 4.0, Wikimedia Commons, https://creativecommons.org/licenses/by-sa/4.0</p>