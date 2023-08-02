import numpy as np
import scipy.signal as sps
from pydub import AudioSegment
from pydub.effects import normalize as pydub_normalize


class AudioService:
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
