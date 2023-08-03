import os
import subprocess
import tempfile
from typing import Dict, List, Optional, Tuple
from urllib.request import urlopen

import numpy as np
import scipy.signal as sps
import torch
from pydub import AudioSegment
from pydub.effects import normalize as pydub_normalize

model, silero_utils = torch.hub.load(
    repo_or_dir=os.environ.get("VAD_DIR", "/root/.cache/torch/hub/snakers_silero_vad"),
    model="silero_vad",
    # force_reload=True,
    source="local",
    onnx=False,
)
(
    get_speech_timestamps,
    _,
    _,
    _,
    _,
) = silero_utils


class AudioService:
    def __init__(self):
        self.model = model
        self.get_speech_timestamps = get_speech_timestamps

    def stereo_to_mono(self, audio: np.ndarray):
        if len(audio.shape) > 1:  # Stereo to mono
            audio = audio.sum(axis=1) / 2

        return audio

    def resample_audio(self, audio: np.ndarray, sampling_rate: int, target_rate: int):
        if sampling_rate != target_rate:
            number_of_samples = round(len(audio) * float(target_rate) / sampling_rate)

            # Since the t param is None, it will only return resampled_x
            audio = sps.resample(audio, number_of_samples)  # type: ignore

        return audio

    def equalize_amplitude(self, audio: np.ndarray, frame_rate: int):
        # Amplitude Equalization, assuming mono-streamed
        # TODO-1: Normalize based on a reference audio from MUCS benchmark? Ref: https://stackoverflow.com/a/42496373
        # TODO-2: Just implement it without pydub? Ref: https://stackoverflow.com/a/61254921
        audio *= 2**15 - 1  # Quantize to int16
        audio_segment = AudioSegment(
            data=audio.astype("int16").tobytes(),
            sample_width=2,
            frame_rate=frame_rate,
            channels=1,
        )
        equalized_audio = pydub_normalize(audio_segment)

        return equalized_audio

    def dequantize_audio(self, audio: AudioSegment):
        dequantized_audio = np.array(audio.get_array_of_samples()).astype("float64") / (
            2**15 - 1
        )
        return dequantized_audio

    def silero_vad_chunking(
        self,
        raw_audio: np.ndarray,
        sample_rate: int,
        max_chunk_duration_s: float,
        min_chunk_duration_s: float = 6,
        min_speech_duration_ms: int = 100,
    ) -> Tuple[List[np.ndarray], List[Dict[str, float]]]:
        wav = torch.from_numpy(raw_audio).float()
        speech_timestamps: Optional[
            List[Dict[str, float]]
        ] = self.get_speech_timestamps(
            wav,
            self.model,
            sampling_rate=sample_rate,
            threshold=0.3,
            min_silence_duration_ms=400,
            speech_pad_ms=200,
            min_speech_duration_ms=min_speech_duration_ms,
        )

        if not speech_timestamps:
            return ([], [])

        # Store timestamps in seconds
        for speech_dict in speech_timestamps:
            speech_dict["start_secs"] = round(speech_dict["start"] / sample_rate, 3)
            speech_dict["end_secs"] = round(speech_dict["end"] / sample_rate, 3)

        adjusted_timestamps = self.__adjust_timestamps(
            speech_timestamps, sample_rate, max_chunk_duration_s, min_chunk_duration_s
        )

        audio_chunks: List[np.ndarray] = [
            wav[timestamps["start"] : timestamps["end"]].numpy()
            for timestamps in adjusted_timestamps
        ]

        return (audio_chunks, adjusted_timestamps)

    def __adjust_timestamps(
        self,
        speech_timestamps: List[Dict[str, float]],
        sample_rate: int,
        max_chunk_duration_s: float,
        min_chunk_duration_s: float,
    ):
        """
        Takes the speech timestamps output by the vad model and further
        splits/merges based on the max_chunk_duration_s/min_chunk_duration_s.

        Returns a list of adjusted timestamps.
        """

        adjusted_timestamps: List[Dict[str, float]] = []

        curr_start = speech_timestamps[0]["start"]
        curr_start_secs = speech_timestamps[0]["start_secs"]
        curr_end_secs = speech_timestamps[0]["end_secs"]

        for i in range(1, len(speech_timestamps)):
            chunk_gap = curr_end_secs - speech_timestamps[i]["start_secs"]
            merged_chunks_duration = speech_timestamps[i]["end_secs"] - curr_start_secs
            chunk_duration = curr_end_secs - curr_start_secs

            # If the gap between the previous chunk and the current chunk is less
            # than 3 seconds, and the previous chunk and current chunk put together
            # are less than equal to the minimum chunk duration, merge the chunks
            # by setting the end timestamp to the current chunk's end timestamp.
            if chunk_gap < 3 and merged_chunks_duration <= min_chunk_duration_s:
                curr_end_secs = speech_timestamps[i]["end_secs"]
                continue

            # Further pass the current chunk duration through windowed chunking to
            # ensure that the size is within max_chunk_duration_s.
            chunked_timestamps = self.__windowed_chunking(
                curr_start,
                curr_start_secs,
                chunk_duration,
                max_chunk_duration_s,
                sample_rate,
            )
            adjusted_timestamps.extend(chunked_timestamps)

            curr_start = speech_timestamps[i]["start"]
            curr_start_secs = speech_timestamps[i]["start_secs"]
            curr_end_secs = speech_timestamps[i]["end_secs"]

        # One last chunk will always be left, add it to the adjusted_timestamps
        chunk_duration = curr_end_secs - curr_start_secs
        chunked_timestamps = self.__windowed_chunking(
            curr_start,
            curr_start_secs,
            chunk_duration,
            max_chunk_duration_s,
            sample_rate,
        )
        adjusted_timestamps.extend(chunked_timestamps)

        return adjusted_timestamps

    def __windowed_chunking(
        self,
        curr_start: float,
        curr_start_secs: float,
        chunk_duration: float,
        max_chunk_duration_s: float,
        sample_rate: int,
    ):
        """
        Checks if the  chunk duration is greater than the max_chunk_duration_s.
        If it is greater, divide into chunks of max_chunk_duration_s till chunk
        duration is fully split and return split timestamps.

        For example, if chunk duration is 10 seconds and max_chunk_duration_s is 3 seconds,
        the split timestamps will be 3s, 3s, 3s, 1s.
        """
        chunked_timestamps: List[Dict[str, float]] = []

        start = curr_start
        start_secs = curr_start_secs
        remaining_chunk_duration = chunk_duration

        # Keep looping through the current chunk till it is fully split
        # into chunks whose duration is <= max_chunk_duration_s
        while remaining_chunk_duration > 0:
            chunk_size = (
                max_chunk_duration_s
                if remaining_chunk_duration - max_chunk_duration_s >= 0
                else remaining_chunk_duration
            )
            remaining_chunk_duration -= chunk_size

            chunked_timestamps.append(
                {
                    "start": int(start),
                    "start_secs": start_secs,
                    "end": int((start_secs + chunk_size) * sample_rate),
                    "end_secs": (start_secs + chunk_size),
                }
            )

            # New start will be previous end + 1
            start = chunked_timestamps[-1]["end"] + 1
            start_secs = round(start / sample_rate, 3)

        return chunked_timestamps

    def download_audio(self, url: str):
        if "youtube.com" in url or "youtu.be" in url or "drive.google.com" in url:
            temp = tempfile.TemporaryDirectory()
            subprocess.call(
                [
                    "yt-dlp",
                    "-x",
                    "--audio-format",
                    "mp3",
                    "--audio-quality",
                    "0",
                    url,
                    "--output",
                    temp.name + "/file.mp3",
                ]
            )

            with open(temp.name + "/file.mp3", "rb") as fhand:
                file_bytes = fhand.read()

            temp.cleanup()

        else:
            file_bytes = urlopen(url).read()

        return file_bytes

    def pad_batch(self, batch_data: list):
        batch_data_lens = np.asarray([len(data) for data in batch_data], dtype=np.int32)
        max_length = max(batch_data_lens)
        batch_size = len(batch_data)

        padded_zero_array = np.zeros((batch_size, max_length), dtype=np.float32)
        for idx, data in enumerate(batch_data):
            padded_zero_array[idx, 0 : batch_data_lens[idx]] = data
        return padded_zero_array, np.reshape(batch_data_lens, [-1, 1])
