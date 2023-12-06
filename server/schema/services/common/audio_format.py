from enum import Enum


class AudioFormat(str, Enum):
    WAV = "wav"
    MP3 = "mp3"
    FLAC = "flac"
    PCM = "pcm"
    FLV = "flv"
    OGG = "ogg"
