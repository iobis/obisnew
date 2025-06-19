---
layout: page
title: Search
---

<div class="section-light">
    <h1 class="mb-4">Search</h1>
    <form class="row g-2 align-items-end mb-4" onsubmit="event.preventDefault(); performSearch();">
        <div class="col-md-2">
            <label for="entity" class="form-label">Search for</label>
            <select id="entity" class="form-select">
                <option value="dataset" selected>Dataset</option>
                <option value="taxon">Scientific name</option>
                <option value="common">Common name</option>
                <option value="area">Area</option>
                <option value="country">Publisher country</option>
            </select>
        </div>
        <div class="col-md-4">
            <label for="query" class="form-label">Search term</label>
            <input type="text" id="query" class="form-control" placeholder="Enter search term" value="">
        </div>
        <div class="col-md-2 d-grid">
            <button type="submit" class="btn">Search</button>
        </div>
    </form>
    <div id="dataset-search-help" class="mt-3">
        Dataset search syntax:
        <code>+</code> signifies AND operation,
        <code>|</code> signifies OR operation,
        <code>-</code> negates a single token,
        <code>"</code> wraps a number of tokens to signify a phrase for searching,
        <code>*</code> at the end of a term signifies a prefix query,
        <code>(</code> and <code>)</code> signify precedence.
    </div>
    <div id="results" class="mt-5"></div>
</div>

<script src="/assets/script.js"></script>
<script>
let currentSkip = 0;
const pageSize = 10;

const entityConfig = {
    dataset: {
        endpoint: 'dataset/search2',
        renderItem: renderDatasetItem
    },
    taxon: {
        endpoint: 'taxon/search',
        renderItem: renderTaxonItem
    },
    common: {
        endpoint: 'taxon/search/common',
        renderItem: renderTaxonItem
    },
    area: {
        endpoint: 'area/search',
        renderItem: renderAreaItem
    },
    country: {
        endpoint: 'country/search',
        renderItem: renderCountryItem
    }
};

async function performSearch(skip = 0) {
    currentSkip = skip;
    const entity = document.getElementById("entity").value;
    const query = document.getElementById("query").value.trim();
    
    if (!query) {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";
        return;
    }

    const encodedQuery = encodeURIComponent(query);
    const config = entityConfig[entity];
    if (!config) {
        console.error(`No configuration found for entity: ${entity}`);
        return;
    }

    const url = `https://api.obis.org/${config.endpoint}?q=${encodedQuery}&size=${pageSize}&skip=${skip}`;

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Searching...</p>";

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.results && data.results.length > 0) {
            renderTable("results", data.results, data.total, skip, pageSize, config.renderItem, performSearch);
        } else {
            resultsDiv.innerHTML = "<p>No results found.</p>";
        }
    } catch (error) {
        resultsDiv.innerHTML = "<p>Error fetching results.</p>";
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var entitySelect = document.getElementById('entity');
    var helpBox = document.getElementById('dataset-search-help');
    if (entitySelect && helpBox) {
        function updateHelpBox() {
            if (entitySelect.value === 'dataset') {
                helpBox.style.display = '';
            } else {
                helpBox.style.display = 'none';
            }
        }
        entitySelect.addEventListener('change', updateHelpBox);
        updateHelpBox(); // Initial call
    }
});

</script>
