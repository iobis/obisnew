async function fetchTaxonomy(query) {
    const params = new URLSearchParams(query);
    const url = `https://api.obis.org/statistics/taxonomy?${params.toString()}`;
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
    
    const content = document.createElement('div');
    
    results.forEach(item => {
        const div = document.createElement("div");
        div.className = "result";
        div.innerHTML = renderItem(item);
        content.appendChild(div);
    });

    const totalPages = Math.ceil(totalResults / pageSize);
    const currentPage = Math.floor(skip / pageSize) + 1;
    
    const paginationDiv = document.createElement("div");
    paginationDiv.id = "pagination";
    paginationDiv.className = "mt-3";

    let paginationHtml = `<div class="d-flex flex-column flex-md-row align-items-center mt-4">`;
    paginationHtml += `<div class="d-flex mb-2 mb-md-0">`;
    paginationHtml += `<button class="btn btn-sm me-2 pagination-prev" ${skip === 0 ? 'disabled' : ''}>Previous</button>`;
    paginationHtml += `<button class="btn btn-sm pagination-next" ${skip + pageSize >= totalResults ? 'disabled' : ''}>Next</button>`;
    paginationHtml += `</div>`;
    paginationHtml += `<div class="ms-3">Showing ${skip + 1}-${Math.min(skip + pageSize, totalResults)} of ${totalResults.toLocaleString("en-US")} results</div>`;
    paginationHtml += `</div>`;
    paginationDiv.innerHTML = paginationHtml;

    content.appendChild(paginationDiv);

    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(content);

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

function renderAreaItem(item) {
    return `
        <div class="area-result">
            <div class="d-flex align-items-center gap-2 mb-2">
                <a href="/area/${item.id}"><strong>${item.name}</strong></a>
                ${item.type && item.type != 'obis' ? `<span class="badge bg-light text-dark">${item.type.toUpperCase()}</span>` : ''}
            </div>
        </div>
    `;
}

function renderCountryItem(item) {
    return `
        <div class="area-result">
            <div class="d-flex align-items-center gap-2 mb-2">
                <a href="/country/${item.id}"><strong>${item.country}</strong></a>
            </div>
        </div>
    `;
}

async function renderTimeplot(element, query) {
    const params = new URLSearchParams(query);
    const url = `https://api.obis.org/statistics/years?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    const results = await response.json();
    
    const maxYear = new Date().getFullYear();
    const startYear = 1950;
    
    const yearMap = new Map();
    for (let year = startYear; year <= maxYear; year++) {
        yearMap.set(year, 0);
    }
    
    results.filter(r => r.year >= startYear).forEach(r => yearMap.set(r.year, r.records));
    
    const data = [{
        type: 'bar',
        x: Array.from(yearMap.keys()),
        y: Array.from(yearMap.values()),
        marker: {
            color: '#B1B695'
        }
    }];

    const layout = {
        title: 'Records per year',
        xaxis: {
            title: 'Year',
            type: 'linear',
            tickformat: 'd'
        },
        yaxis: {
            title: 'Number of records'
        },
        margin: {
            l: 50,
            r: 20,
            b: 50,
            t: 50,
            pad: 4
        },
        height: 300
    };

    Plotly.newPlot(element, data, layout, {
        responsive: true,
        displayModeBar: false
    });
}

async function renderEnvironmentPlots(element, query) {
    const params = new URLSearchParams(query);
    const url = `https://api.obis.org/statistics/env?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();

    const sstData = [{
        type: 'bar',
        x: data.sst.map(d => `${d.sst}-${d.sst + 5}`),
        y: data.sst.map(d => d.records),
        name: 'SST',
        marker: {
            color: '#B1B695'
        }
    }];

    const depthData = [{
        type: 'bar',
        x: data.depth.map((d, i) => {
            const nextDepth = i < data.depth.length - 1 ? data.depth[i + 1].from : d.from + 1000;
            return `${d.from}-${nextDepth}`;
        }),
        y: data.depth.map(d => d.records),
        name: 'Depth',
        marker: {
            color: '#B1B695'
        }
    }];

    const sstLayout = {
        xaxis: {
            title: {
                text: 'Sea surface temperature (°C)',
                standoff: 10
            },
            type: 'category'
        },
        yaxis: {
            title: {
                standoff: 10
            }
        },
        margin: {
            l: 50,
            r: 20,
            b: 50,
            t: 0,
            pad: 4
        },
        height: 150
    };

    const depthLayout = {
        xaxis: {
            title: {
                text: 'Sample depth (m)',
                standoff: 10
            },
            type: 'category',
            tickangle: -45,
            tickfont: {
                size: 10
            }
        },
        yaxis: {
            title: {
                standoff: 10
            }
        },
        margin: {
            l: 50,
            r: 20,
            b: 100,
            t: 0,
            pad: 4
        },
        height: 150
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '20px';
    document.getElementById(element).appendChild(container);

    const sstContainer = document.createElement('div');
    const depthContainer = document.createElement('div');

    container.appendChild(sstContainer);
    container.appendChild(depthContainer);

    Plotly.newPlot(sstContainer, sstData, sstLayout, config);
    Plotly.newPlot(depthContainer, depthData, depthLayout, config);
}

function renderDatasetTable(containerId, filter, pageSize = 10) {
    let currentSkip = 0;

    async function fetchDatasets(skip = 0) {
        currentSkip = skip;
        
        const params = new URLSearchParams({
            size: pageSize,
            skip: skip,
            ...filter
        });
        
        const url = `https://api.obis.org/dataset?${params}`;
        const resultsDiv = document.getElementById(containerId);

        // fix height
        if (Array.from(resultsDiv.children).some(child => child.tagName === 'DIV')) {
            const height = resultsDiv.offsetHeight;
            resultsDiv.style.height = height + "px";
        }

        resultsDiv.innerHTML = "<p>Searching...</p>";

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.results && data.results.length > 0) {
                renderTable(containerId, data.results, data.total, skip, pageSize, renderDatasetItem, fetchDatasets);
            } else {
                resultsDiv.innerHTML = "<p>No results found.</p>";
            }
        } catch (error) {
            resultsDiv.innerHTML = "<p>Error fetching results.</p>";
            console.error(error);
        }

        // reset height
        requestAnimationFrame(() => {
            resultsDiv.style.height = "";
        });

    }

    fetchDatasets();
        
}

function renderTaxonTable(containerId, endpoint, filter, pageSize = 10) {
    let currentSkip = 0;

    async function fetchTaxa(skip = 0) {
        currentSkip = skip;
        
        const params = new URLSearchParams({
            size: pageSize,
            skip: skip,
            ...filter
        });
        
        const url = `https://api.obis.org${endpoint}?${params}`;
        const resultsDiv = document.getElementById(containerId);

        // fix height
        if (Array.from(resultsDiv.children).some(child => child.tagName === 'DIV')) {
            const height = resultsDiv.offsetHeight;
            resultsDiv.style.height = height + "px";
        }

        resultsDiv.innerHTML = "<p>Searching...</p>";

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.results && data.results.length > 0) {
                renderTable(containerId, data.results, data.total, skip, pageSize, renderTaxonItem, fetchTaxa);
            } else {
                resultsDiv.innerHTML = "<p>No results found.</p>";
            }
        } catch (error) {
            resultsDiv.innerHTML = "<p>Error fetching results.</p>";
            console.error(error);
        }

        // reset height
        requestAnimationFrame(() => {
            resultsDiv.style.height = "";
        });

    }

    fetchTaxa();
        
}

async function renderMeasurementTypes(element, filter) {
    const params = new URLSearchParams({
        facets: 'measurementTypeCombination',
        dropped: 'include',
        absence: 'include',
        ...filter
    });
    
    const url = `https://api.obis.org/facet?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    
    const resultsDiv = document.getElementById(element);
    if (!data.results.measurementTypeCombination || 
        !Array.isArray(data.results.measurementTypeCombination) || 
        data.results.measurementTypeCombination.length === 0) {
        resultsDiv.innerHTML = "<p>No measurement types found.</p>";
        return;
    }

    let tableHtml = `
        <table class="table">
            <thead>
                <tr>
                    <th>Measurement type</th>
                    <th>Measurement type ID</th>
                    <th>Records</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.results.measurementTypeCombination.forEach(item => {
        const [name, uri] = item.key.split('|');
        tableHtml += `
            <tr>
                <td>${name}</td>
                <td><a href="${uri}" target="_blank">${uri}</a></td>
                <td>${item.records.toLocaleString("en-US")}</td>
            </tr>
        `;
    });

    tableHtml += `
            </tbody>
        </table>
    `;

    resultsDiv.innerHTML = tableHtml;
}

