from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
import requests
import os

router = APIRouter()

templates = Environment(loader=FileSystemLoader("templates"))
shell_templates = Jinja2Templates(directory="static")

@router.get("/{area_id}", response_class=HTMLResponse)
async def area(request: Request, area_id: int):
    try:
        response = requests.get(f"https://api.obis.org/area/{area_id}")
        response.raise_for_status()
        data = response.json()
        
        if not data.get("results"):
            raise HTTPException(status_code=404, detail="Area not found")
            
        area = data["results"][0]
        
        area_block = templates.get_template("portal/index.html").render(
            area=area
        )

        return shell_templates.TemplateResponse(
            request=request,
            name="portal/index.html",
            context={
                "title": area["name"],
                "content": area_block
            }
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Area not found") 