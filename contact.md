---
layout: page
title: Contact
permalink: /contact/
---

<div class="section-light">

<h1>Contact</h1>

{% assign nodes = site.data.nodes.results %}
  {% for node in nodes %}
    <h4>{{ node.name }}</h4>
    <p>
    {% for u in node.url %}
        <a href="{{ u }}" target="_blank">{{ u }}</a>
    {% endfor %}
    </p>

    <ul class="contacts">
    {% for contact in node.contacts %}
        <li>
            {{ contact.givenname }} {{ contact.surname }}
            <a class="ms-2" href="mailto:{{ contact.email }}"><i class="bi bi-envelope-fill"></i></a>
        </li>
    {% endfor %}
    </ul>
  {% endfor %}

</div>