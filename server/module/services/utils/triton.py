import tritonclient.http as http_client
from tritonclient.utils import *
import numpy as np

from .audio import pad_batch

def get_string_tensor(string_values, tensor_name: str):
    string_obj = np.array(string_values, dtype="object")
    input_obj = http_client.InferInput(tensor_name, string_obj.shape, np_to_triton_dtype(string_obj.dtype))
    input_obj.set_data_from_numpy(string_obj)
    return input_obj

def get_bool_tensor(bool_values, tensor_name: str):
    bool_obj = np.array(bool_values, dtype="bool")
    input_obj = http_client.InferInput(tensor_name, bool_obj.shape, np_to_triton_dtype(bool_obj.dtype))
    input_obj.set_data_from_numpy(bool_obj)
    return input_obj

def get_uint8_tensor(uint8_values, tensor_name: str):
    uint8_obj = np.array(uint8_values, dtype="uint8")
    input_obj = http_client.InferInput(tensor_name, uint8_obj.shape, np_to_triton_dtype(uint8_obj.dtype))
    input_obj.set_data_from_numpy(uint8_obj)
    return input_obj

def get_translation_io_for_triton(texts: list, src_lang: str, tgt_lang: str):
    inputs = [
        get_string_tensor([[text] for text in texts], "INPUT_TEXT"),
        get_string_tensor([[src_lang]] * len(texts), "INPUT_LANGUAGE_ID"),
        get_string_tensor([[tgt_lang]] * len(texts), "OUTPUT_LANGUAGE_ID"),
    ]
    outputs = [
        http_client.InferRequestedOutput("OUTPUT_TEXT")
    ]
    return inputs, outputs

def get_transliteration_io_for_triton(input_string: str, source_lang: str, target_lang: str, is_word_level: bool, top_k: int):
    inputs = [
        get_string_tensor([input_string], "INPUT_TEXT"),
        get_string_tensor([source_lang], "INPUT_LANGUAGE_ID"),
        get_string_tensor([target_lang], "OUTPUT_LANGUAGE_ID"),
        get_bool_tensor([is_word_level], "IS_WORD_LEVEL"),
        get_uint8_tensor([top_k], "TOP_K"),
    ]
    outputs = [
        http_client.InferRequestedOutput("OUTPUT_TEXT")
    ]
    return inputs, outputs


def get_tts_io_for_triton(input_string: str, ip_gender: str, ip_language: str):
    inputs = [
        get_string_tensor([input_string], "INPUT_TEXT"),
        get_string_tensor([ip_gender], "INPUT_SPEAKER_ID"),
        get_string_tensor([ip_language], "INPUT_LANGUAGE_ID"),
    ]
    outputs = [
        http_client.InferRequestedOutput("OUTPUT_GENERATED_AUDIO")
    ]
    return inputs, outputs

def get_asr_io_for_triton(audio_chunks: list):
    o = pad_batch(audio_chunks)
    input0 = http_client.InferInput("AUDIO_SIGNAL", o[0].shape, "FP32")
    input1 = http_client.InferInput("NUM_SAMPLES", o[1].shape, "INT32")
    input0.set_data_from_numpy(o[0])
    input1.set_data_from_numpy(o[1].astype("int32"))
    inputs = [input0, input1]

    outputs = [
        http_client.InferRequestedOutput("TRANSCRIPTS")
    ]
    return inputs, outputs

