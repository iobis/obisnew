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
      leaf: { opacity: 1 },
      branchvalues: "total"
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
                ${item.commonName ? `<span>${item.commonName}</span>` : ``}
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

function renderPublisherItem(item) {
    return `
        <div class="area-result">
            <div class="d-flex align-items-center gap-2 mb-3">
                <a href="/publisher/${item.id}"><strong>${item.name}</strong></a>
                <span class="badge bg-light text-dark">${item.records.toLocaleString("en-US")} records</span>
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
        xaxis: {
            title: 'Year',
            type: 'linear',
            tickformat: 'd',
            fixedrange: true
        },
        yaxis: {
            automargin: true,
            title: {
                text: 'Records',
                standoff: 10
            },
            fixedrange: true
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
            type: 'category',
            fixedrange: true
        },
        yaxis: {
            title: {
                text: "Records",
                standoff: 10
            },
            fixedrange: true
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
            },
            fixedrange: true
        },
        yaxis: {
            title: {
                text: "Records",
                standoff: 10
            },
            fixedrange: true
        },
        margin: {
            l: 50,
            r: 20,
            b: 100,
            t: 0,
            pad: 4
        },
        height: 170
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

function renderPublisherTable(containerId, filter, pageSize = 10) {
    let currentSkip = 0;

    async function fetchPublishers(skip = 0) {
        currentSkip = skip;
        
        const params = new URLSearchParams({
            size: pageSize,
            skip: skip,
            ...filter
        });
        
        const url = `https://api.obis.org/institute?${params}`;
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
                renderTable(containerId, data.results, data.total, skip, pageSize, renderPublisherItem, fetchPublishers);
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

    fetchPublishers();
        
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
        size: 100,
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

async function renderDNATable(element, filter) {
    const params = new URLSearchParams({
        composite: true,
        facets: 'pcr_primer_name_forward,pcr_primer_name_reverse,target_gene,pcr_primer_forward,pcr_primer_reverse,seq_meth,pcr_primer_reference',
        ...filter
    });
    
    const url = `https://api.obis.org/facet?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    
    const resultsDiv = document.getElementById(element);
    if (!data.results || data.results.length === 0) {
        resultsDiv.innerHTML = "<p>No sequence related metadata found.</p>";
        return;
    }

    let html = '';
    data.results.forEach((item, index) => {
        const key = item.key;
        html += `
            <div class="mb-4">
                <h4 class="d-flex justify-content-between align-items-center">
                    Primer set ${index + 1}
                </h4>
                <p>${item.records.toLocaleString("en-US")} records</p>
                <table class="table table-sm">
                    <tbody>
                        <tr>
                            <th>Target gene</th>
                            <td>${key.target_gene || '-'}</td>
                        </tr>
                        <tr>
                            <th style="width: 200px;">Forward primer name</th>
                            <td>${key.pcr_primer_name_forward || '-'}</td>
                        </tr>
                        <tr>
                            <th>Reverse primer name</th>
                            <td>${key.pcr_primer_name_reverse || '-'}</td>
                        </tr>
                        <tr>
                            <th>Forward primer</th>
                            <td>${key.pcr_primer_forward || '-'}</td>
                        </tr>
                        <tr>
                            <th>Reverse primer</th>
                            <td>${key.pcr_primer_reverse || '-'}</td>
                        </tr>
                        <tr>
                            <th>Sequencing method</th>
                            <td>${key.seq_meth || '-'}</td>
                        </tr>
                        <tr>
                            <th>Reference</th>
                            <td>${key.pcr_primer_reference || '-'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    });

    resultsDiv.innerHTML = html;
}

async function renderPublications(element, defaultYear = new Date().getFullYear()) {
    const container = document.getElementById(element);
    container.innerHTML = `
        <div class="row">
            <div class="col-12 mt-4">
                <div id="publications-graph"></div>
            </div>
            <div class="col-12 mt-4">
                <div id="publications-table"></div>
            </div>
        </div>
    `;

    const graphResponse = await fetch('https://api.obis.org/publications/graph');
    if (!graphResponse.ok) {
        throw new Error(`HTTP error ${graphResponse.status}`);
    }
    const graphData = await graphResponse.json();

    const plotlyData = [{
        type: 'bar',
        x: graphData.results.map(d => d.year),
        y: graphData.results.map(d => d.publications),
        marker: {
            color: '#B1B695'
        }
    }];

    const layout = {
        xaxis: {
            title: 'Year',
            type: 'linear',
            tickformat: 'd'
        },
        yaxis: {
            title: {
                text: 'Publications',
                standoff: 10
            }
        },
        margin: {
            l: 50,
            r: 20,
            b: 50,
            t: 20,
            pad: 4
        },
        height: 200
    };

    Plotly.newPlot('publications-graph', plotlyData, layout, {
        responsive: true,
        displayModeBar: false
    });

    async function renderYearPublications(year) {
        const tableDiv = document.getElementById('publications-table');
        tableDiv.innerHTML = '<p>Loading publications...</p>';

        try {
            const response = await fetch(`https://api.obis.org/publications/${year}`);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                tableDiv.innerHTML = `<p>No publications found for ${year}.</p>`;
                return;
            }

            let html = `
                <h4>Publications in ${year}</h4>
                <ul class="list-unstyled mt-4">
            `;

            data.results.forEach(pub => {
                html += `
                    <li class="mb-3">
                        ${pub.rr}
                        ${pub.pubinst ? `<a href="https://www.vliz.be/imisdocs/publications/${pub.pubinst}" class="badge badge-download ms-2">download publication</a>` : ''}
                    </li>
                `;
            });

            html += `</ul>`;

            tableDiv.innerHTML = html;
        } catch (error) {
            tableDiv.innerHTML = '<p>Error loading publications.</p>';
            console.error(error);
        }
    }

    document.getElementById('publications-graph').on('plotly_click', function(data) {
        const year = data.points[0].x;
        renderYearPublications(year);
    });

    renderYearPublications(defaultYear);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
}

async function renderEvents(element) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 0);
    const startDate = lastMonth.toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 12, 0).toISOString().split('T')[0];

    const url = `https://www.oceanexpert.org/api/v1/getEventCalendar/269.json?start=${startDate}&end=${endDate}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    
    const container = document.getElementById(element);
    if (!data.events || Object.keys(data.events).length === 0) {
        container.innerHTML = '<p>No upcoming events found.</p>';
        return;
    }

    let html = '';
    Object.entries(data.events).forEach(([month, events]) => {
        html += `
            <div class="mb-4">
                <h5>${month}</h5>
                <ul class="list-unstyled">
        `;

        events.forEach(event => {
            const location = event.city ? `${event.city}${event.country ? `, ${event.country}` : ''}` : event.country || '';
            const startDate = formatDate(event.startOn);
            const endDate = formatDate(event.endOn);
            const dateStr = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
            
            html += `
                <li class="mb-3">
                    <div class="row">
                        <div class="col-3">
                            ${dateStr}
                        </div>
                        <div class="col-9">
                            <div class="fw-bold"><a href="https://www.oceanexpert.org/event/${event.idEvent}" target="_blank">${event.title}</a></div>
                            ${event.shorttitle ? `<div>${event.shorttitle}</div>` : ''}
                            ${location ? `<div>${location}</div>` : ''}
                            ${event.isOpen ? `<div>${event.isOpen}</div>` : ''}
                        </div>
                    </div>
                </li>
            `;
        });

        html += `
                </ul>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderSunburst(element, filter) {
    fetchTaxonomy(filter).then(convertToSunburst).then((data) => {
        var layout = {
            margin: {l: 0, r: 0, b: 30, t: 30},
            sunburstcolorway: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"]
            // sunburstcolorway: ["#54bebe", "#76c8c8", "#98d1d1", "#badbdb", "#dedad2", "#e4bcad", "#df979e", "#d7658b", "#c80064"]
        };
        Plotly.newPlot(element, data, layout);
    });
}
