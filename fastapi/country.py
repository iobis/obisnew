from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
import requests

router = APIRouter()

templates = Environment(loader=FileSystemLoader("templates"))
shell_templates = Jinja2Templates(directory="static")

@router.get("/{country_id}", response_class=HTMLResponse)
async def country(request: Request, country_id: int):
    try:
        response = requests.get(f"https://api.obis.org/country/{country_id}")
        response.raise_for_status()
        data = response.json()
        
        if not data.get("results"):
            raise HTTPException(status_code=404, detail="Country not found")
            
        country = data["results"][0]
        
        country_block = templates.get_template("country.html").render(
            country=country
        )

        return shell_templates.TemplateResponse(
            request=request,
            name="portal/index.html",
            context={
                "title": country["country"],
                "content": country_block
            }
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Country not found") 