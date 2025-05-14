---
layout: default
---

<section>
  <div class="container">

    <h2>News</h2>

    <div class="row row-cols-1 row-cols-md-3 g-4">
        {% for post in site.posts %}
        <div class="col">
          <div class="card card-dark">
            <div src="#" style="height: 200px;" class="card-img-top"></div>
            <div class="card-body">
              <h5 class="card-title"><a href="{{ post.url }}">{{ post.title }}</a></h5>
              <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
              <p>
                {% for tag in post.tags %}
                    <span class="badge">{{ tag }}</span>
                {% endfor %}
              </p>
            </div>
          </div>
        </div>
        {% endfor %}
    </div>

  </div>

</section>

<section class="section-dark">
  <div class="container">
    <h2>Data products</h2>
    <div class="row row-cols-1 row-cols-md-3 g-4">
      {% for data_product in site.data_products %}
        <div class="col">
          <div class="card card-light">
            <div class="card-body">
              <h5 class="card-title"><a href="{{ data_product.website }}">{{ data_product.title }}</a></h5>
              <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
              <p>
                {% for tag in post.tags %}
                    <span class="badge">{{ tag }}</span>
                {% endfor %}
              </p>
            </div>
          </div>
        </div>
      {% endfor %}
    </div>
  </div>
</section>

<section>
  <div class="container">

  <h2>Projects</h2>

  {% include project_cards.html %}

  </div>
</section>