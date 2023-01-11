import os
import json
import requests
from copy import deepcopy

from .schema import *

_pwd = os.path.dirname(__file__)

class Registry:
    '''
    A temporary file-based implementation of registry
    '''
    def __init__(self, models_registry_path=None, services_registry_path=None):
        if not models_registry_path:
            models_registry_path = os.path.join(_pwd, "models_registry.json")
        with open(models_registry_path, encoding="utf-8") as f:
            self.models_registry = json.load(f)
        
        if not services_registry_path:
            services_registry_path = os.path.join(_pwd, "services_registry.json")
        with open(services_registry_path, encoding="utf-8") as f:
            self.services_registry = json.load(f)
            self.public_services_registry = deepcopy(self.services_registry)
            for service_id, service_json in self.public_services_registry.items():
                # Remove confidential details
                service_json.pop("endpoint", None)

class InferenceManager:
    def __init__(self):
        self.registry = Registry()
    
    def run_inference(self, request: GenericInferenceRequest_ULCA):
        # Temporary implementation - Just act as proxy to existing (non-Dhruva) deployments
        service_json = self.registry.services_registry[request.serviceId]
        task_type = self.registry.models_registry[service_json["modelId"]]["task"]["type"]
        request_body = request.dict()

        if task_type == "translation":
            # Temporary patch for NMT: Since the deployment hosts multiple models, it requires `modelId` explicitly
            lang_pair = request_body["config"]["language"]
            lang_pair = lang_pair["sourceLanguage"] + '-' + lang_pair["targetLanguage"]
            request_body["config"]["modelId"] = LANG_TRANS_MODEL_CODES[lang_pair] if lang_pair in LANG_TRANS_MODEL_CODES else DEFAULT_ULCA_INDIC_TO_INDIC_MODEL_ID

        return requests.post(
            service_json["endpoint"],
            json=request_body,
        ).json()

# modelIds for NMT, taken from https://github.com/AI4Bharat/Chitralekha-Backend/blob/d1a19628fe2619d7a11549a82811b5a45533be29/backend/translation/metadata.py#L77-L102
LANG_TRANS_MODEL_CODES = {
    "hi-en": 100,
    "bn-en": 101,
    "ta-en": 102,
    "en-hi": 103,
    "en-ta": 104,
    "en-as": 110,
    "en-bn": 112,
    "en-gu": 114,
    "en-kn": 116,
    "en-ml": 118,
    "en-mr": 120,
    "en-or": 122,
    "en-pa": 124,
    "en-te": 126,
    "as-en": 128,
    "gu-en": 130,
    "kn-en": 132,
    "ml-en": 134,
    "mr-en": 136,
    "or-en": 138,
    "pa-en": 140,
    "te-en": 142,
}
DEFAULT_ULCA_INDIC_TO_INDIC_MODEL_ID = 144
