from typing import Union

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()


from typing import Callable
from prometheus_fastapi_instrumentator.metrics import Info
from prometheus_client import Counter


def http_body_language() -> Callable[[Info], None]:
    METRIC = Counter(
        "http_body_language", "Number of times a certain language has been requested.", labelnames=("langs",)
    )

    def instrumentation(info: Info) -> None:
        lang_str = info.request.body['langs']
        METRIC.labels(langs=lang_str).inc()

    return instrumentation


@app.on_event("startup")
async def startup():
    Instrumentator().instrument(app).add(http_body_language()).expose(app)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/")
def post_root(body: dict):
    return body


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
