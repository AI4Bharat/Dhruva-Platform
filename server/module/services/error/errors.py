from enum import Enum


class Errors(Enum):
    DHRUVA101 = {"kind": "DHRUVA-101", "message": "Failed to send request"}
    DHRUVA102 = {
        "kind": "DHRUVA-102",
        "message": "Request responded with failed status",
    }
    DHRUVA103 = {"kind": "DHRUVA-103", "message": "Failed to fetch all services"}
    DHRUVA104 = {
        "kind": "DHRUVA-104",
        "message": "Failed to get service details from db",
    }
    DHRUVA105 = {"kind": "DHRUVA-105", "message": "Failed to get model details from db"}
    DHRUVA106 = {"kind": "DHRUVA-106", "message": "Failed to fetch all models"}
    DHRUVA107 = {"kind": "DHRUVA-107", "message": "Failed to get triton ready"}
    DHRUVA108 = {"kind": "DHRUVA-108", "message": "Failed to parse request"}
    DHRUVA109 = {
        "kind": "DHRUVA-109",
        "message": "Failed to get Dashboard details from db",
    }
    DHRUVA110 = {"kind": "DHRUVA-110", "message": "Failed to submit feedback"}
    DHRUVA111 = {
        "kind": "DHRUVA-111",
        "message": "Failed to send request to create grafana snapshot",
    }
    DHRUVA112 = {
        "kind": "DHRUVA-112",
        "message": "Request to create grafana snapshot responded with failed status",
    }
    DHRUVA113 = {
        "kind": "DHRUVA-113",
        "message": "Failed to update health status of service",
    }
    DHRUVA114 = {
        "kind": "DHRUVA-114",
        "message": "Failed to fetch feedback",
    }
    DHRUVA115 = {
        "kind": "DHRUVA-115",
        "message": "Invalid task type in database",
    }
    DHRUVA116 = {"kind": "DHRUVA-116", "message": "Failed to fetch file from link"}
