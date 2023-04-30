import io
import base64
import logging
from typing import List
import soundfile as sf
from bson import ObjectId
from .database import AppDatabase

# Constant multipiers to calculate cost equivalents later
from .constants import (
    ASR_GPU_MULTIPLIER,
    ASR_CPU_MULTIPLIER,
    ASR_RAM_MULTIPLIER,
    TTS_CPU_MULTIPLIER,
    TTS_GPU_MULTIPLIER,
    TTS_RAM_MULTIPLIER,
    TTS_TOKEN_CALCULATION_MULTIPLIER,
    NMT_CPU_MULTIPLIER,
    NMT_GPU_MULTIPLIER,
    NMT_RAM_MULTIPLIER,
    NMT_TOKEN_CALCULATION_MULTIPLIER,
    NER_CPU_MULTIPLIER,
    NER_GPU_MULTIPLIER,
    NER_RAM_MULTIPLIER,
    NER_TOKEN_CALCULATION_MULTIPLIER,
)

metering_db = AppDatabase()


def get_audio_length(audio) -> float:
    file_handle = io.BytesIO(audio)
    data, sampling_rate = sf.read(file_handle)
    return data.shape[0] / sampling_rate


def calculate_asr_usage(data) -> int:
    total_usage = 0
    for d in data:
        audio = base64.b64decode(d["audioContent"])
        length = get_audio_length(audio)
        total_usage += (
            length * ASR_GPU_MULTIPLIER * ASR_CPU_MULTIPLIER * ASR_RAM_MULTIPLIER
        )

    return total_usage


def calculate_translation_usage(data) -> int:
    # ** Note: **
    # Can't use respective tokenizers of different models since
    # the number of endpoints / models might grow to a large number
    # Using a standard tokenizer for all languages will require one
    # supporting all languages. Which is itself not accurate.
    # Hence using number of characters
    total_usage = 0
    for d in data:
        total_usage += (
            len(d["source"])
            * NMT_TOKEN_CALCULATION_MULTIPLIER
            * NMT_GPU_MULTIPLIER
            * NMT_CPU_MULTIPLIER
            * NMT_RAM_MULTIPLIER
        )

    return total_usage


def calculate_tts_usage(data: List) -> int:
    total_usage = 0
    for d in data:
        total_usage += (
            len(d["source"])
            * TTS_TOKEN_CALCULATION_MULTIPLIER
            * TTS_GPU_MULTIPLIER
            * TTS_CPU_MULTIPLIER
            * TTS_RAM_MULTIPLIER
        )

    return total_usage


def calculate_ner_usage(data: List) -> int:
    # ** Note: **
    # Can't use respective tokenizers of different models since
    # the number of endpoints / models might grow to a large number
    # Using a standard tokenizer for all languages will require one
    # supporting all languages. Which is itself not accurate.
    # Hence using number of characters
    total_usage = 0
    for d in data:
        total_usage += (
            len(d["source"])
            * NER_TOKEN_CALCULATION_MULTIPLIER
            * NER_GPU_MULTIPLIER
            * NER_CPU_MULTIPLIER
            * NER_RAM_MULTIPLIER
        )

    return total_usage


def write_to_db(api_key_id: str, inference_units: int, service_id: str):
    """
    - Check doc presence or create
    - Check subdocument presence or create
    Currently no single method to check for document as well as subdocument level upsert
    """
    metering_collection = metering_db["api_key"]
    doc = metering_collection.find_one({"_id": ObjectId(api_key_id)})

    if doc is None:
        print("No document found for the API key")
        return

    # Check for the document
    if "services" in doc and doc["services"]:
        # Check for services
        for service in doc["services"]:
            if service["service_id"] == service_id:
                service["usage"] += inference_units
                service["hits"] += 1
                break
        else:
            # Insert service sub document
            doc["services"].append({"service_id": service_id, "usage": inference_units, "hits": 1})

        doc["usage"] += inference_units
        doc["hits"] += 1
        res = metering_collection.replace_one({"_id": doc["_id"]}, doc)

    else:
        # Create the serviceId and set usage
        metering_collection.update_one(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "services": [{"service_id": service_id, "usage": inference_units, "hits": 1}],
                    "usage": inference_units,
                    "hits": 1
                }
            }
        )


def meter_usage(api_key_id: str, input_data: List, usage_type: str, service_id: str):
    """Meters usage and writes to Mongo"""

    inference_units = 0
    if usage_type == "asr":
        inference_units = calculate_asr_usage(input_data)
    elif usage_type == "translation" or usage_type == "transliteration":
        inference_units = calculate_translation_usage(input_data)
    elif usage_type == "tts":
        inference_units = calculate_tts_usage(input_data)

    logging.info(f"inference units: {inference_units}")
    write_to_db(api_key_id, inference_units, service_id)
