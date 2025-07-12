import requests
import urllib
import json
import re


def get_quality_statistics(filters: dict):
    params = urllib.parse.urlencode(filters)
    api_url = f"https://api.obis.org/statistics/qc?{params}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        result = response.json()
        return result
    except Exception as e:
        print(e)


def get_dataset_variables(filters: dict):
    params = urllib.parse.urlencode(filters)
    api_url = f"https://api.obis.org/facet?size=10&facets=measurementTypeCombination&{params}";
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        result = response.json()
        return result["results"]["measurementTypeCombination"]
    except Exception as e:
        print(e)


def get_statistics(filters: dict):
    params = urllib.parse.urlencode(filters)
    api_url = f"https://api.obis.org/statistics?{params}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        result = response.json()
        return result
    except Exception as e:
        print(e)


def render_jsonld(dataset, statistics=None, variables=None):
    if dataset:

        keywords = []
        if "keywords" in dataset and dataset["keywords"]:
            keywords = [k["keyword"] for k in dataset["keywords"]]

        try:
            jsonld = {
                "@context": {
                    "@vocab": "https://schema.org/"
                },
                "@type": "Dataset",
                "@id": f"https://obis.org/dataset/{dataset['id']}",
                "name": dataset.get('title'),
                "description": dataset.get('abstract'),
                "url": f"https://obis.org/dataset/{dataset['id']}",
                "sameAs": [dataset.get("url")],
                "license": dataset.get("intellectualrights"),
                "citation": dataset.get("citation"),
                "version": dataset.get("published"),
                "keywords": keywords,
                "variableMeasured": [],
                "includedInDataCatalog": {
                    "@id": "https://obis.org",
                    "@type": "DataCatalog",
                    "url": "https://obis.org"
                }
            }
            
            if (statistics and statistics.get("yearrange") and len(statistics["yearrange"]) == 2):
                jsonld["temporalCoverage"] = f"{statistics['yearrange'][0]}/{statistics['yearrange'][1]}"
            
            citation_id = dataset.get("citation_id")
            if citation_id and "10." in citation_id:
                jsonld["sameAs"].append(citation_id)
                
                regex = r'10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+'
                match = re.search(regex, citation_id)
                
                if match:
                    doi_val = match.group(0)
                    jsonld["identifier"] = {
                        "@id": f"https://doi.org/{doi_val}",
                        "@type": "PropertyValue",
                        "propertyID": "https://registry.identifiers.org/registry/doi",
                        "value": f"doi:{doi_val}",
                        "url": f"https://doi.org/{doi_val}"
                    }
                else:
                    jsonld["identifier"] = f"https://obis.org/dataset/{dataset['id']}"
            else:
                jsonld["identifier"] = f"https://obis.org/dataset/{dataset['id']}"
            
            if dataset.get("archive"):
                jsonld["distribution"] = {
                    "@type": "DataDownload",
                    "contentUrl": dataset["archive"],
                    "encodingFormat": "application/zip"
                }
            
            if variables:
                jsonld["variableMeasured"] = []
                for variable in variables:
                    parts = variable["key"].split("|")
                    variable_obj = {
                        "@type": "PropertyValue",
                        "name": parts[0],
                        "url": parts[1] if len(parts) > 1 else None,
                        "description": parts[0]
                    }
                    jsonld["variableMeasured"].append(variable_obj)
            
            extent = dataset.get("extent")
            if extent:
                regex = r'\(\((.+)\)\)'
                match = re.search(regex, extent)
                
                if match and match.group(1):
                    polygon_coords = match.group(1)
                    
                    coord_pairs = polygon_coords.split(',')
                    reversed_coords = []
                    
                    for pair in coord_pairs:
                        coords = pair.strip().split(' ')
                        if len(coords) >= 2:
                            lon, lat = float(coords[0]), float(coords[1])
                            reversed_coords.append(f"{lat} {lon}")
                    
                    reversed_polygon = ", ".join(reversed_coords)
                    
                    jsonld["spatialCoverage"] = {
                        "@type": "Place",
                        "geo": {
                            "@type": "GeoShape",
                            "polygon": reversed_polygon
                        },
                        "additionalProperty": {
                            "@type": "PropertyValue",
                            "propertyID": "http://dbpedia.org/resource/Spatial_reference_system",
                            "value": "http://www.w3.org/2003/01/geo/wgs84_pos#lat_long"
                        }
                    }
            
            institutes = dataset.get("institutes", [])
            if institutes:
                providers = []
                for institute in institutes:
                    if "oceanexpert_id" in institute:
                        provider = {
                            "@id": f"https://oceanexpert.org/institution/{institute['oceanexpert_id']}",
                            "@type": "Organization",
                            "legalName": institute.get("name"),
                            "name": institute.get("name"),
                            "url": f"https://oceanexpert.org/institution/{institute['oceanexpert_id']}"
                        }
                        providers.append(provider)
                
                if providers:
                    jsonld["provider"] = providers
                    jsonld["creator"] = providers
            
            json_str = json.dumps(jsonld, indent=4)
            return f'<script type="application/ld+json">{json_str}</script>'
            
        except Exception as error:
            pass
    
    return ""
