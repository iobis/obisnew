async function fetchNodeTaxonomy(nodeid) {
    const url = `https://api.obis.org/statistics/taxonomy?nodeid=${nodeid}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
}

async function fetchDatasetTaxonomy(datasetid) {
    const url = `https://api.obis.org/statistics/taxonomy?datasetid=${datasetid}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
}

function convertToSunburst(taxonomyTree) {
    const { labels, parents, values } = flattenForSunburst(taxonomyTree);
    const plotlyData = [{
      type: "sunburst",
      labels,
      parents,
      values,
      leaf: { opacity: 1 }
    }];
    return plotlyData;
}

function flattenForSunburst(node, parent = "") {
    const labels = [];
    const parents = [];
    const values = [];

    function recurse(currentNode, currentParent) {
        let { name, value, children } = currentNode;

        if (name === currentParent) {
            name = `${name}_child`;
        }

        if (typeof value !== "number" && Array.isArray(children)) {
            value = children.reduce((sum, child) => {
                return sum + (typeof child.value === "number" ? child.value : 0);
            }, 0);
        }

        labels.push(name);
        parents.push(currentParent);
        values.push(value);

        if (children && children.length > 0) {
            for (const child of children) {
                recurse(child, name);
            }
        }
    }

    recurse(node, parent);
    return { labels, parents, values };
}

function renderTable(element, results, totalResults, skip, pageSize, renderItem, onPageChange) {
    const resultsDiv = document.getElementById(element);
        
    resultsDiv.innerHTML = "";
    
    results.forEach(item => {
        const div = document.createElement("div");
        div.className = "result";
        div.innerHTML = renderItem(item);
        resultsDiv.appendChild(div);
    });

    const totalPages = Math.ceil(totalResults / pageSize);
    const currentPage = Math.floor(skip / pageSize) + 1;
    
    const paginationDiv = document.createElement("div");
    paginationDiv.id = "pagination";
    paginationDiv.className = "mt-3";
    resultsDiv.appendChild(paginationDiv);

    let paginationHtml = `<div class="d-flex align-items-center mt-4">`;
    paginationHtml += `<button class="btn btn-sm me-2 pagination-prev" ${skip === 0 ? 'disabled' : ''}>Previous</button>`;
    paginationHtml += `<button class="btn btn-sm me-3 pagination-next" ${skip + pageSize >= totalResults ? 'disabled' : ''}>Next</button>`;
    paginationHtml += `<div>Showing ${skip + 1}-${Math.min(skip + pageSize, totalResults)} of ${totalResults.toLocaleString("en-US")} results</div>`;
    paginationHtml += `</div>`;
    paginationDiv.innerHTML = paginationHtml;

    const prevButton = paginationDiv.querySelector('.pagination-prev');
    const nextButton = paginationDiv.querySelector('.pagination-next');
    
    if (prevButton && !prevButton.disabled) {
        prevButton.addEventListener('click', () => onPageChange(skip - pageSize));
    }
    if (nextButton && !nextButton.disabled) {
        nextButton.addEventListener('click', () => onPageChange(skip + pageSize));
    }
}

function renderDatasetItem(item) {
    const recordCount = item.records || (item.statistics && item.statistics.Occurrence);
    return `
        <div class="d-flex align-items-center gap-2">
            <a href="/dataset/${item.id}"><strong>${item.title}</strong></a>
            <span class="badge bg-light text-dark">${recordCount.toLocaleString("en-US")} records</span>
        </div>
        <p>${item.url}</p>
    `;
}

function renderTaxonItem(item) {
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