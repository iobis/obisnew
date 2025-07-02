from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from auth import router as auth_router
import os
from node import router as node_router
from dataset import router as dataset_router
from taxon import router as taxon_router
from area import router as area_router
from country import router as country_router
from organization import router as organization_router
from doi import router as doi_router
from export import router as export_router


app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "your-random-secret-key"))

templates = Jinja2Templates(directory="fastapi/templates")

app.include_router(auth_router)

app.include_router(node_router, prefix="/node")
app.include_router(dataset_router, prefix="/dataset")
app.include_router(taxon_router, prefix="/taxon")
app.include_router(area_router, prefix="/area")
app.include_router(country_router, prefix="/country")
app.include_router(organization_router, prefix="/organization")
app.include_router(doi_router, prefix="/doi")
app.include_router(export_router, prefix="/export")
