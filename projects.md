---
layout: page
title: Projects
permalink: /projects/
---

# Projects

Example projects page.

{% for project in site.projects %}
<h4><a href="{{ project.website }}" target="_blank">{{ project.title }}</a></h4>
<p>{{ project.description }}</p>
{% endfor %}
