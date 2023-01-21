# from typing import Union, Callable
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# from prometheus_fastapi_instrumentator import Instrumentator
# from prometheus_fastapi_instrumentator.metrics import Info

# from prometheus_client import Counter
from exception.base_error import BaseError
from module import ServicesApiRouter
from fastapi.logger import logger

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


# def http_body_language() -> Callable[[Info], None]:
#     METRIC = Counter(
#         "http_body_language",
#         "Number of times a certain language has been requested.",
#         labelnames=("langs",)
#     )

#     def instrumentation(info: Info) -> None:
#         lang_str = info.request.body['langs']
#         METRIC.labels(langs=lang_str).inc()

#     return instrumentation


# @app.on_event("startup")
# async def load_prometheus():
#     Instrumentator().instrument(app).add(http_body_language()).expose(app)


@app.exception_handler(BaseError)
async def base_error_handler(request: Request, exc: BaseError):
    logger.error(exc)

    return JSONResponse(
        status_code=500,
        content={
            "detail": {
                "kind": exc.error_kind,
                "message": "Request failed. Please try again.",
            }
        },
    )


@app.get("/")
def read_root():
    return "Welcome to Dhruva API!"


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=5050, log_level="info", workers=2)
