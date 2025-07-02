from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
import requests


router = APIRouter()
templates = Environment(loader=FileSystemLoader("templates"))
shell_templates = Jinja2Templates(directory="static")


@router.get("/{export_id}", response_class=HTMLResponse)
async def export_page(request: Request, export_id: str):

    # fetch export DOI metadata

    doi = f"10.25607/obis.export.{export_id}"
    url = f"https://data.datacite.org/application/vnd.datacite.datacite+json/{doi}"
    try:
        resp = requests.get(url, headers={"Accept": "application/vnd.datacite.datacite+json"})
        resp.raise_for_status()
        export = resp.json()
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"DOI metadata not found for export {export_id}")

    # render

    block = templates.get_template("export.html").render(
        export=export
    )
    return shell_templates.TemplateResponse(
        request=request,
        name="portal/index.html",
        context={
            "title": f"Export {export_id}",
            "content": block
        }
    )