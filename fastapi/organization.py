from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
import requests
import urllib

router = APIRouter()

templates = Environment(loader=FileSystemLoader("templates"))
shell_templates = Jinja2Templates(directory="static")


@router.get("/{organization_id}", response_class=HTMLResponse)
async def organization_page(request: Request, organization_id: str):

    api_url = f"https://api.obis.org/institute/{organization_id}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        response_json = response.json()
        organization = response_json["results"][0]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Organization not found")

    block = templates.get_template("organization.html").render(
        organization=organization
    )

    return shell_templates.TemplateResponse(
        request=request,
        name="portal.html",
        context={
            "title": organization["name"],
            "content": block
        }
    )