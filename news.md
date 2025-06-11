---
layout: page
---

<section class="section-light">
  <div class="container">
    <h1>News</h1>
    <div class="mt-5">
        {% assign filtered_posts = site.posts | sort: 'date' | reverse %}
        {% include post_cards.html filtered_posts=filtered_posts limit=100 %}
    </div>
  </div>
</section>
