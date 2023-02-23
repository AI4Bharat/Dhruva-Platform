import io
import base64
import logging
from typing import List
import soundfile as sf
from .database import get_db_client

# Constant multipiers to calculate cost equivalents later
from .constants import (
    ASR_GPU_MULTIPLIER,
    ASR_CPU_MULTIPLIER,
    ASR_RAM_MULTIPLIER,
    TTS_CPU_MULTIPLIER,
    TTS_GPU_MULTIPLIER,
    TTS_RAM_MULTIPLIER,
    NMT_CPU_MULTIPLIER,
    NMT_GPU_MULTIPLIER,
    NMT_RAM_MULTIPLIER,
    NMT_TOKEN_CALCULATION_MULTIPLIER,
    NER_CPU_MULTIPLIER,
    NER_GPU_MULTIPLIER,
    NER_RAM_MULTIPLIER,
    NER_TOKEN_CALCULATION_MULTIPLIER,
)


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
        audio = base64.b64decode(d["audioContent"])
        length = get_audio_length(audio)
        total_usage += (
            length * TTS_GPU_MULTIPLIER * TTS_CPU_MULTIPLIER * TTS_RAM_MULTIPLIER
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


def write_to_db(api_key_name: str, inference_units: int, service_id: str):
    metering_db = get_db_client("dhruva")
    user = metering_db.api_key.find_one({"api_key": api_key_name})
    doc = metering_db.dhruva.find_one({"_id": user["user"]})

    # Check field presence and then update
    # Getting the whole dodument and doing one write
    # Can check presence of nested doc in one read and can do 2 separate updates
    # Adds a lot of write traffic to the db
    # Keeping it simple for now
    for d in doc["metering"]["api_keys"]:
        if d["api_key_hash"] == api_key_name and d["service_id"] == service_id:
            print("insinde")
            d["usage"] += inference_units
            doc["metering"]["total"] += inference_units

    metering_db.dhruva.update_one(
        {'_id': user["user"]},
        {"$set":{'metering': doc["metering"]}},
        False,
        True
    )
    doc = metering_db.dhruva.find_one({"_id": user["user"]})
    logging.debug(f"doc: {doc}")


def meter_usage(api_key_name: str, input_data: List, usage_type: str, service_id: str):
    """Meters usage and writes to Mongo"""

    inference_units = 0
    if usage_type == "asr":
        inference_units = calculate_asr_usage(input_data)
    elif usage_type == "translation":
        inference_units = calculate_translation_usage(input_data)
    elif usage_type == "tts":
        inference_units = calculate_tts_usage(input_data)

    logging.debug(f"inference units: {inference_units}")
    write_to_db(api_key_name, inference_units, service_id)
