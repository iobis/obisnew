---
layout: default
---

<section class="section-light">
  <div class="container">
    <h2>News</h2>

    <p class="tagline">Get the latest on all things OBIS</p>

    {% assign filtered_posts = site.posts | sort: 'date' | reverse %}
    {% include post_cards.html filtered_posts=filtered_posts limit=6 %}
  </div>

</section>

<section class="section-dark">
  <div class="container">
    <h2>Use cases</h2>

    {% assign filtered_usecases = site.usecases %}
    {% include usecase_cards.html filtered_usecases=filtered_usecases limit=6 %}
  </div>
</section>

<section class="section-light">
  <div class="container">

  <h2>Projects</h2>

  {% include project_cards.html %}

  </div>
</section>

<section class="section-dark">
  <div class="container">

    <div class="row align-items-center">
      
      <div class="col-md-4 mb-4 mb-md-0">
        <h2>OBIS in numbers</h2>
      </div>

      <div class="col-md-8">
        <div class="row">
          
          <div class="col-6 col-md-4 mb-4">
            <div class="display-5 fw-bold">137M</div>
            <div>species observations</div>
          </div>

          <div class="col-6 col-md-4 mb-4">
            <div class="display-5 fw-bold">195K</div>
            <div>marine species</div>
          </div>

          <div class="col-6 col-md-4 mb-4">
            <div class="display-5 fw-bold">36</div>
            <div>nodes worldwide</div>
          </div>

          <div class="col-6 col-md-4 mb-4">
            <div class="display-5 fw-bold">27M</div>
            <div>DNA sequences</div>
          </div>

          <div class="col-6 col-md-4 mb-4">
            <div class="display-5 fw-bold">6K</div>
            <div>scientists &amp; data managers</div>
          </div>

          <div class="col-6 col-md-4 mb-4">
            <div class="display-5 fw-bold">99</div>
            <div>countries engaged</div>
          </div>

        </div>
      </div>

    </div>

  </div>
</section>

<section class="section-light">
  <div class="container">
    <h2>Recent datasets</h2>
    <div id="datasets" class="row row-cols-1 row-cols-md-3 g-4"></div>
  </div>
</section>

<script>
function truncateText(text, maxLength) {
  let ellipsis = "...";
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength + 1);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  if (lastSpaceIndex === -1) return text.slice(0, maxLength) + ellipsis;
  return text.slice(0, lastSpaceIndex) + ellipsis;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

async function loadRecentDatasets() {
  try {
    const response = await fetch("https://api.obis.org/dataset/published?size=6");
    const data = await response.json();

    const container = document.getElementById("datasets");
    container.innerHTML = "";

    data.results.forEach(dataset => {
      const card = document.createElement("div");
      card.className = "col";

      card.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">
            <a href="/dataset/${dataset.id}">${dataset.title}</a>
          </h5>
          <p class="card-text">${formatDate(dataset.published)}</p>
          <p class="card-text">${truncateText(dataset.abstract, 500)}</p>
        </div>
      </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading datasets:", error);
  }
}

window.addEventListener("DOMContentLoaded", loadRecentDatasets);
</script>