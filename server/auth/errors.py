from enum import Enum


class Errors(Enum):
    DHRUVA_DEP100 = {
        "kind": "DHRUVA-DEP-100",
        "message": "Found no default api key in DB",
    }
