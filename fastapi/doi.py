from fastapi import APIRouter, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
from datetime import date
from obisdois import ObisDoi
import uuid


router = APIRouter()

templates = Environment(loader=FileSystemLoader("templates"))
shell_templates = Jinja2Templates(directory="static")


def get_user(request: Request):
    return request.session.get('user')


def parse_and_validate_uuids(raw_input):
    candidates = [item.strip() for line in raw_input.splitlines() for item in line.split(',')]
    candidates = [c for c in candidates if c]
    valid_uuids = []
    invalid_uuids = []
    for c in candidates:
        try:
            valid_uuids.append(str(uuid.UUID(c)))
        except ValueError:
            invalid_uuids.append(c)
    return valid_uuids, invalid_uuids


@router.get("/", response_class=HTMLResponse)
async def doi_page(request: Request):
    user = get_user(request)
    today = date.today()
    formatted = today.strftime('%Y-%m-%d')

    block = templates.get_template("doi.html").render(
        user=user,
        date=formatted
    )

    return shell_templates.TemplateResponse(
        request=request,
        name="portal/index.html",
        context={
            "title": "Request a DOI",
            "content": block
        }
    )


@router.post("/", response_class=HTMLResponse)
async def doi_submit(request: Request, title: str = Form(...), datasetids: str = Form(...)):
    user = get_user(request)

    if not user:
        return RedirectResponse(url="/doi")

    # reserve doi

    dataset_ids, invalid_ids = parse_and_validate_uuids(datasetids)

    doi = ObisDoi()
    doi.suffix = str(uuid.uuid4()).split("-")[0]
    doi.title = title
    doi.set_related(dataset_ids)
    doi.populate()
    data = doi.reserve()

    # render

    block = templates.get_template("doi.html").render(
        user=user,
        confirmation=True,
        doi=data["data"]["id"]
    )

    return shell_templates.TemplateResponse(
        request=request,
        name="portal/index.html",
        context={
            "title": "Request a DOI",
            "content": block
        }
    )
