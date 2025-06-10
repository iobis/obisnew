---
layout: page
title: Contact
permalink: /contact/
---

<div class="section-light">

<h1>Team and contacts</h1>

{% assign nodes = site.data.nodes.results %}
{% for node in nodes %}
  <section class="section-superdense">
    <h4 class="nodename">{{ node.name }}</h4>
    <p>
    {% for u in node.url %}
        <a href="{{ u }}" target="_blank">{{ u }}</a>
    {% endfor %}
    </p>

    <div class="row">
        {% for contact in node.contacts %}
        <div class="col-md-3">
            <p><b>{{ contact.givenname }} {{ contact.surname }}</b>
            <br/>{{ contact.email }}</p>
        </div>
        {% endfor %}
    </div>
  </section>
{% endfor %}

</div>