---
layout: default
---

<section>
  <h2>News</h2>

  {% for post in site.posts %}
    <div>
      <h4><a href="{{ post.url }}">{{ post.title }}</a></h4>
      <p>
        {% for tag in post.tags %}
            <span class="badge bg-light text-muted">{{ tag }}</span>
        {% endfor %}
      </p>
    </div>
  {% endfor %}

</section>

<section>

  <h2>Data products</h2>

  {% for data_product in site.data_products %}
    <h4><a href="{{ data_product.website }}">{{ data_product.title }}</a></h4>
  {% endfor %}

</section>

<section>

  <h2>Projects</h2>

  {% for project in site.projects %}
    <h4><a href="{{ project.website }}" target="_blank">{{ project.title }}</a></h4>
    <p>{{ project.description }}</p>
  {% endfor %}

</section>