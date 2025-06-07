---
layout: page
title: Search
permalink: /search/
---

<div class="section-light">
    <h1 class="mb-4">Search</h1>
    <form class="row g-2 align-items-end mb-4" onsubmit="event.preventDefault(); performSearch();">
        <div class="col-md-2">
            <label for="entity" class="form-label">Search for</label>
            <select id="entity" class="form-select">
                <option value="dataset" selected>Dataset</option>
                <option value="taxon">Taxon</option>
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
    <div id="results" class="mt-5"></div>
    <div id="pagination" class="mt-3"></div>
</div>

<script>
let currentSkip = 0;
const pageSize = 10;

const entityConfig = {
    dataset: {
        endpoint: 'dataset/search2',
        template: (item) => `
            <div class="d-flex align-items-center gap-2">
                <a href="/dataset/${item.id}"><strong>${item.title}</strong></a>
                <span class="badge bg-light text-dark">${item.statistics.Occurrence.toLocaleString("en-US")} records</span>
            </div>
            <p>${item.url}</p>
        `
    },
    taxon: {
        endpoint: 'taxon/search',
        template: (item) => {
            const lineage = [];
            if (item.kingdom) lineage.push(item.kingdom);
            if (item.phylum) lineage.push(item.phylum);
            if (item.class) lineage.push(item.class);
            if (item.order) lineage.push(item.order);
            if (item.family) lineage.push(item.family);
            if (item.genus) lineage.push(item.genus);
            
            return `
                <div class="taxon-result">
                    <div class="d-flex align-items-center gap-2">
                        <a href="/taxon/${item.taxonID}"><strong>${item.scientificName}</strong></a>
                        ${item.scientificNameAuthorship ? `<span class="text-muted">${item.scientificNameAuthorship}</span>` : ''}
                        ${item.taxonomicStatus !== 'accepted' ? `<span class="badge bg-warning">${item.taxonomicStatus}</span>` : ''}
                        ${item.taxonRank ? `<span class="badge bg-light text-dark">${item.taxonRank}</span>` : ''}
                    </div>
                    <p>
                        ${lineage.length > 0 ? lineage.join(' > ') : ''}
                        ${item.acceptedNameUsage && item.taxonomicStatus !== 'accepted' ? 
                            `<br>Accepted name: <a href="/taxon/${item.acceptedNameUsageID}">${item.acceptedNameUsage}</a>` : 
                            ''}
                    </p>
                </div>
            `;
        }
    }
};

async function performSearch(skip = 0) {
    currentSkip = skip;
    const entity = document.getElementById("entity").value;
    const query = document.getElementById("query").value.trim();
    
    if (!query) {
        const resultsDiv = document.getElementById("results");
        const paginationDiv = document.getElementById("pagination");
        resultsDiv.innerHTML = "";
        paginationDiv.innerHTML = "";
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
    const paginationDiv = document.getElementById("pagination");
    resultsDiv.innerHTML = "<p>Searching...</p>";
    paginationDiv.innerHTML = "";

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.results && data.results.length > 0) {
            resultsDiv.innerHTML = "";
            data.results.forEach(item => {
                const div = document.createElement("div");
                div.className = "result";
                div.innerHTML = config.template(item);
                resultsDiv.appendChild(div);
            });

            const totalResults = data.total || 0;
            const totalPages = Math.ceil(totalResults / pageSize);
            const currentPage = Math.floor(skip / pageSize) + 1;

            let paginationHtml = `<div class="d-flex align-items-center mt-4">`;
            paginationHtml += `<button class="btn btn-sm me-2" onclick="performSearch(${skip - pageSize})" ${skip === 0 ? 'disabled' : ''}>Previous</button>`;
            paginationHtml += `<button class="btn btn-sm me-3" onclick="performSearch(${skip + pageSize})" ${skip + pageSize >= totalResults ? 'disabled' : ''}>Next</button>`;
            paginationHtml += `<div>Showing ${skip + 1}-${Math.min(skip + pageSize, totalResults)} of ${totalResults.toLocaleString("en-US")} results</div>`;
            paginationHtml += `</div>`;
            paginationDiv.innerHTML = paginationHtml;
        } else {
            resultsDiv.innerHTML = "<p>No results found.</p>";
        }
    } catch (error) {
        resultsDiv.innerHTML = "<p>Error fetching results.</p>";
        console.error(error);
    }
}
</script>
