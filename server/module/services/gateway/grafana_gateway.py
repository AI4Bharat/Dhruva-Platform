import json
import os
import traceback
from typing import Any, Dict

import requests

from exception.base_error import BaseError
from schema.services.response import CreateGrafanaSnapshotResponse

from ..error.errors import Errors


class GrafanaGateway:
    def create_grafana_snapshot(self, snapshot_json: str):
        headers = {"Authorization": "Bearer " + os.environ["GRAFANA_AUTH_TOKEN"]}

        try:
            r = requests.post(
                os.environ["GRAFANA_URL"] + "/api/snapshots",
                json=json.loads(snapshot_json),
                headers=headers,
            )
        except Exception:
            raise BaseError(Errors.DHRUVA111.value, traceback.format_exc())

        if r.status_code >= 400:
            BaseError(Errors.DHRUVA112.value)

        res = CreateGrafanaSnapshotResponse(**r.json())
        return res
