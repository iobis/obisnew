from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
import requests
import urllib

router = APIRouter()

templates = Environment(loader=FileSystemLoader("templates"))
shell_templates = Jinja2Templates(directory="static")


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


def process_contacts(contacts):
    unique_contacts = {}
    
    for contact in contacts:
        givenname = contact.get('givenname') or ''
        surname = contact.get('surname') or ''
        name = f"{givenname} {surname}".strip()
        if not name:
            name = contact.get('organization') or ''
        if not name:
            continue
            
        if name not in unique_contacts or (
            contact.get('organization') and 
            not unique_contacts[name].get('organization')
        ):
            unique_contacts[name] = contact
            unique_contacts[name]["clean_name"] = name
    
    return list(unique_contacts.values())


@router.get("/{dataset_id}", response_class=HTMLResponse)
async def dataset_page(request: Request, dataset_id: str):

    # dataset metadata

    api_url = f"https://api.obis.org/dataset/{dataset_id}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        response_json = response.json()
        dataset = response_json["results"][0]
        
        if "contacts" in dataset:
            dataset["clean_contacts"] = process_contacts(dataset["contacts"])
            
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Dataset not found")

    # quality statistics

    quality_statistics = get_quality_statistics({
        "datasetid": dataset_id,
        "dropped": "include",
        "absence": "include"
    })

    # render

    dataset_block = templates.get_template("dataset.html").render(
        dataset=dataset,
        quality_statistics=quality_statistics
    )

    return shell_templates.TemplateResponse(
        request=request,
        name="portal.html",
        context={
            "title": dataset["title"],
            "content": dataset_block
        }
    )