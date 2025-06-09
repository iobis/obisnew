from fastapi import FastAPI

from node import router as node_router
from dataset import router as dataset_router
from taxon import router as taxon_router
from area import router as area_router

app = FastAPI()

app.include_router(node_router, prefix="/node")
app.include_router(dataset_router, prefix="/dataset")
app.include_router(taxon_router, prefix="/taxon")
app.include_router(area_router, prefix="/area")
