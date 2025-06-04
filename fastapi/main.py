from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from jinja2 import Environment, FileSystemLoader
from fastapi.templating import Jinja2Templates
import os
import requests

app = FastAPI()

templates = Environment(loader=FileSystemLoader("templates"))
shell_templates = Jinja2Templates(directory="static")


@app.get("/dataset/{dataset_id}", response_class=HTMLResponse)
async def dataset_page(request: Request, dataset_id: str):

    api_url = f"https://api.obis.org/dataset/{dataset_id}"
    response = requests.get(api_url)
    response_json = response.json()
    dataset = response_json["results"][0]

    dataset_block = templates.get_template("dataset.html").render(
        dataset=dataset
    )

    return shell_templates.TemplateResponse(
        request=request, name="portal.html", context={"content": dataset_block}
    )
