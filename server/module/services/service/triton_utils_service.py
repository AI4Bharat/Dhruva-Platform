from typing import List

import numpy as np
import tritonclient.http as http_client
from fastapi import Depends
from tritonclient.utils import np_to_triton_dtype


class TritonUtilsService:
    def get_string_tensor(self, string_values, tensor_name: str):
        string_obj = np.array(string_values, dtype="object")
        input_obj = http_client.InferInput(
            tensor_name, string_obj.shape, np_to_triton_dtype(string_obj.dtype)
        )
        input_obj.set_data_from_numpy(string_obj)
        return input_obj

    def get_bool_tensor(self, bool_values, tensor_name: str):
        bool_obj = np.array(bool_values, dtype="bool")
        input_obj = http_client.InferInput(
            tensor_name, bool_obj.shape, np_to_triton_dtype(bool_obj.dtype)
        )
        input_obj.set_data_from_numpy(bool_obj)
        return input_obj

    def get_uint8_tensor(self, uint8_values, tensor_name: str):
        uint8_obj = np.array(uint8_values, dtype="uint8")
        input_obj = http_client.InferInput(
            tensor_name, uint8_obj.shape, np_to_triton_dtype(uint8_obj.dtype)
        )
        input_obj.set_data_from_numpy(uint8_obj)
        return input_obj

    def get_translation_io_for_triton(self, texts: list, src_lang: str, tgt_lang: str):
        inputs = [
            self.get_string_tensor([[text] for text in texts], "INPUT_TEXT"),
            self.get_string_tensor([[src_lang]] * len(texts), "INPUT_LANGUAGE_ID"),
            self.get_string_tensor([[tgt_lang]] * len(texts), "OUTPUT_LANGUAGE_ID"),
        ]
        outputs = [http_client.InferRequestedOutput("OUTPUT_TEXT")]
        return inputs, outputs

    def get_transliteration_io_for_triton(
        self,
        input_string: str,
        source_lang: str,
        target_lang: str,
        is_word_level: bool,
        top_k: int,
    ):
        inputs = [
            self.get_string_tensor([input_string], "INPUT_TEXT"),
            self.get_string_tensor([source_lang], "INPUT_LANGUAGE_ID"),
            self.get_string_tensor([target_lang], "OUTPUT_LANGUAGE_ID"),
            self.get_bool_tensor([is_word_level], "IS_WORD_LEVEL"),
            self.get_uint8_tensor([top_k], "TOP_K"),
        ]
        outputs = [http_client.InferRequestedOutput("OUTPUT_TEXT")]
        return inputs, outputs

    def get_tts_io_for_triton(
        self, input_string: str, ip_gender: str, ip_language: str
    ):
        inputs = [
            self.get_string_tensor([input_string], "INPUT_TEXT"),
            self.get_string_tensor([ip_gender], "INPUT_SPEAKER_ID"),
            self.get_string_tensor([ip_language], "INPUT_LANGUAGE_ID"),
        ]
        outputs = [http_client.InferRequestedOutput("OUTPUT_GENERATED_AUDIO")]
        return inputs, outputs

    def get_asr_io_for_triton(
        self,
        audio_chunks: List[np.ndarray],
        service_id: str,
        language: str,
        n_best_tok: int = 0,
    ):
        o = self.__pad_batch(audio_chunks)
        input0 = http_client.InferInput("AUDIO_SIGNAL", o[0].shape, "FP32")
        input1 = http_client.InferInput("NUM_SAMPLES", o[1].shape, "INT32")
        input0.set_data_from_numpy(o[0])
        input1.set_data_from_numpy(o[1].astype("int32"))
        inputs = [input0, input1]

        if (
            "conformer-hi" not in service_id
            and "conformer-ta" not in service_id
            and "whisper" not in service_id
            and language != "en"
        ):
            # The other endpoints are multilingual and hence have LANG_ID as extra input
            # TODO: Standardize properly as a string similar to NMT and TTS, in all Triton repos
            input2 = http_client.InferInput("LANG_ID", (len(audio_chunks), 1), "BYTES")
            lang_id = [language] * len(audio_chunks)
            input2.set_data_from_numpy(
                np.asarray(lang_id).astype("object").reshape((len(audio_chunks), 1))
            )
            inputs.append(input2)

        if n_best_tok > 0:
            input3 = http_client.InferInput("TOPK", o[1].shape, "INT32")
            input3.set_data_from_numpy(
                np.array([n_best_tok] * len(o[1])).reshape(o[1].shape).astype("int32")
            )
            inputs.append(input3)

        outputs = [http_client.InferRequestedOutput("TRANSCRIPTS")]
        return inputs, outputs

    def get_vad_io_for_triton(
        self,
        audio: np.ndarray,
        sample_rate: int,
        threshold: float,
        min_silence_duration_ms: int,
        speech_pad_ms: int,
        min_speech_duration_ms: int,
    ):
        audio_signal, audio_len = self.__pad_batch([audio])

        input0 = http_client.InferInput("WAVPATH", audio_signal.shape, "FP32")
        input0.set_data_from_numpy(audio_signal)
        input1 = http_client.InferInput("SAMPLING_RATE", audio_len.shape, "INT32")
        input1.set_data_from_numpy(np.asarray([[sample_rate]]).astype("int32"))
        input2 = http_client.InferInput("THRESHOLD", audio_len.shape, "FP32")
        input2.set_data_from_numpy(np.asarray([[threshold]]).astype("float32"))
        input3 = http_client.InferInput(
            "MIN_SILENCE_DURATION_MS", audio_len.shape, "INT32"
        )
        input3.set_data_from_numpy(
            np.asarray([[min_silence_duration_ms]]).astype("int32")
        )
        input4 = http_client.InferInput("SPEECH_PAD_MS", audio_len.shape, "INT32")
        input4.set_data_from_numpy(np.asarray([[speech_pad_ms]]).astype("int32"))
        input5 = http_client.InferInput(
            "MIN_SPEECH_DURATION_MS", audio_len.shape, "INT32"
        )
        input5.set_data_from_numpy(
            np.asarray([[min_speech_duration_ms]]).astype("int32")
        )

        inputs = [input0, input1, input2, input3, input4, input5]
        outputs = [http_client.InferRequestedOutput("TIMESTAMPS")]

        return inputs, outputs

    def __pad_batch(self, batch_data: List):
        batch_data_lens = np.asarray([len(data) for data in batch_data], dtype=np.int32)
        max_length = max(batch_data_lens)
        batch_size = len(batch_data)

        padded_zero_array = np.zeros((batch_size, max_length), dtype=np.float32)
        for idx, data in enumerate(batch_data):
            padded_zero_array[idx, 0 : batch_data_lens[idx]] = data
        return padded_zero_array, np.reshape(batch_data_lens, [-1, 1])
