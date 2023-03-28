import json
import os
import traceback

import requests

from exception.base_error import BaseError
from schema.services.response import CreateGrafanaSnapshotResponse

from ..error.errors import Errors


class GrafanaGateway:
    def __init__(self) -> None:
        service_specific_dashboard_path = (
            "/".join(
                os.path.dirname(os.path.realpath(__file__))
                .replace("\\", "/")
                .split("/")[:-3]
            )
            + "/dashboards/service_specific_dashboard.json"
        )
        with open(service_specific_dashboard_path, "r") as fhand:
            self.service_specific_dashboard = json.loads(fhand.read())

    def create_grafana_snapshot(self):
        headers = {"Authorization": "Bearer " + os.environ["GRAFANA_AUTH_TOKEN"]}

        try:
            r = requests.post(
                os.environ["GRAFANA_URL"],
                json=self.service_specific_dashboard,
                headers=headers,
            )
        except Exception:
            raise BaseError(Errors.DHRUVA111.value, traceback.format_exc())

        if r.status_code >= 400:
            BaseError(Errors.DHRUVA112.value)

        res = CreateGrafanaSnapshotResponse(**r.json())
        return res
