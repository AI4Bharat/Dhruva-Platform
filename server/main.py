from typing import Union, Callable
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import Counter
from exception.base_error import BaseError
from log.logger import LogConfig
from module import *
from fastapi.logger import logger
from logging.config import dictConfig
from starlette.applications import Starlette
from starlette_exporter import PrometheusMiddleware, handle_metrics


dictConfig(LogConfig().dict())

app = FastAPI(
    title="Dhruva API",
    description="Backend API for communicating with the Dhruva platform",
)

app.include_router(ServicesApiRouter)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(PrometheusMiddleware)
app.add_route("/metrics", handle_metrics)

@app.exception_handler(BaseError)
async def base_error_handler(request: Request, exc: BaseError):
    logger.error(exc)

    return JSONResponse(
        status_code=500,
        content={"detail": {"kind": exc.error_kind, "message": f"Request failed. Please try again."}},
    )


@app.get("/")
def read_root():
    return "Welcome to Dhruva API!"


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=5050, log_level="info", workers=2)
