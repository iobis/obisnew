from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
import requests

router = APIRouter()

templates = Environment(loader=FileSystemLoader("templates"))
shell_templates = Jinja2Templates(directory="static")

@router.get("/{dataset_id}", response_class=HTMLResponse)
async def dataset_page(request: Request, dataset_id: str):
    api_url = f"https://api.obis.org/dataset/{dataset_id}"

    try:
        response = requests.get(api_url)
        response.raise_for_status()
        response_json = response.json()
        dataset = response_json["results"][0]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Dataset not found")

    dataset_block = templates.get_template("dataset.html").render(
        dataset=dataset
    )

    return shell_templates.TemplateResponse(
        request=request,
        name="portal.html",
        context={"content": dataset_block}
    )