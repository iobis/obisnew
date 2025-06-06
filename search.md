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

async function performSearch(skip = 0) {
    currentSkip = skip;
    const entity = document.getElementById("entity").value;
    const query = encodeURIComponent(document.getElementById("query").value);
    const url = `https://api.obis.org/${entity}/search2?q=${query}&size=${pageSize}&skip=${skip}`;

    const resultsDiv = document.getElementById("results");
    const paginationDiv = document.getElementById("pagination");
    resultsDiv.innerHTML = "<p>Searching...</p>";
    paginationDiv.innerHTML = "";

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.results && data.results.length > 0) {
            resultsDiv.innerHTML = "";
            data.results.forEach(dataset => {
                const div = document.createElement("div");
                div.className = "result";
                div.innerHTML = `
                    <a href="/dataset/${dataset.id}"><strong>${dataset.title}</strong></a><br>
                    <p><b>${dataset.statistics.Occurrence.toLocaleString("en-US")}</b> records - ${dataset.url}</p>
                `;
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
