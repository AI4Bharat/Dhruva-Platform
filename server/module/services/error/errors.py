from enum import Enum


class Errors(Enum):
    DHRUVA101 = {"kind": "DHRUVA-101", "message": "Failed to send request"}
    DHRUVA102 = {"kind": "DHRUVA-102",
                 "message": "Request responded with failed status"}
    DHRUVA103 = {"kind": "DHRUVA-103",
                 "message": "Failed to fetch all services"}
    DHRUVA104 = {"kind": "DHRUVA-104",
                 "message": "Failed to get service details from db"}
    DHRUVA105 = {"kind": "DHRUVA-105",
                 "message": "Failed to get model details from db"}
