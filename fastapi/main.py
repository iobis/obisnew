from fastapi import FastAPI

from dataset import router as dataset_router

app = FastAPI()

app.include_router(dataset_router, prefix="/dataset")