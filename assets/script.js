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

async function convertToSunburst(taxonomyTree) {
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
