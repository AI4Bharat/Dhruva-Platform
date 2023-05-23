import collections
import io
import subprocess
import tempfile
from urllib.request import urlopen

import numpy as np
import webrtcvad
from pydub import AudioSegment


def pad_batch(batch_data: list):
    batch_data_lens = np.asarray([len(data) for data in batch_data], dtype=np.int32)
    max_length = max(batch_data_lens)
    batch_size = len(batch_data)

    padded_zero_array = np.zeros((batch_size, max_length), dtype=np.float32)
    for idx, data in enumerate(batch_data):
        padded_zero_array[idx, 0 : batch_data_lens[idx]] = data
    return padded_zero_array, np.reshape(batch_data_lens, [-1, 1])

class Frame(object):
    """Represents a "frame" of audio data."""

    def __init__(self, bytes, timestamp, duration):
        self.bytes = bytes
        self.timestamp = timestamp
        self.duration = duration


def frame_generator(frame_duration_ms, audio, sample_rate):
    """Generates audio frames from PCM audio data.
    Takes the desired frame duration in milliseconds, the PCM data, and
    the sample rate.
    Yields Frames of the requested duration.
    """
    n = int(sample_rate * (frame_duration_ms / 1000.0) * 2)
    offset = 0
    timestamp = 0.0
    duration = (float(n) / sample_rate) / 2.0
    while offset + n < len(audio):
        yield Frame(audio[offset : offset + n], timestamp, duration)
        timestamp += duration
        offset += n


def vad_collector_old(sample_rate, frame_duration_ms, padding_duration_ms, vad, audio_bytes):
    num_padding_frames = int(padding_duration_ms / frame_duration_ms)
    # We use a deque for our sliding window/ring buffer.
    ring_buffer = collections.deque(maxlen=num_padding_frames)
    # We have two states: TRIGGERED and NOTTRIGGERED. We start in the
    # NOTTRIGGERED state.
    triggered = False

    voiced_frames = []
    for frame in frame_generator(frame_duration_ms, audio_bytes, sample_rate):
        is_speech = vad.is_speech(frame.bytes, sample_rate)

        #         sys.stdout.write('1' if is_speech else '0')
        if not triggered:
            ring_buffer.append((frame, is_speech))
            num_voiced = len([f for f, speech in ring_buffer if speech])
            # If we're NOTTRIGGERED and more than 90% of the frames in
            # the ring buffer are voiced frames, then enter the
            # TRIGGERED state.
            if num_voiced > 0.9 * ring_buffer.maxlen:
                triggered = True
                #                 sys.stdout.write('+(%s)' % (ring_buffer[0][0].timestamp,))
                # We want to yield all the audio we see from now until
                # we are NOTTRIGGERED, but we have to start with the
                # audio that's already in the ring buffer.
                for f, s in ring_buffer:
                    voiced_frames.append(f)
                ring_buffer.clear()
        else:
            # We're in the TRIGGERED state, so collect the audio data
            # and add it to the ring buffer.
            voiced_frames.append(frame)
            ring_buffer.append((frame, is_speech))
            num_unvoiced = len([f for f, speech in ring_buffer if not speech])
            # If more than 90% of the frames in the ring buffer are
            # unvoiced, then enter NOTTRIGGERED and yield whatever
            # audio we've collected.
            if num_unvoiced > 0.9 * ring_buffer.maxlen:
                #                 sys.stdout.write('-(%s)' % (frame.timestamp + frame.duration))
                triggered = False
                start_frame = voiced_frames[0].timestamp
                end_frame = voiced_frames[-1].timestamp + voiced_frames[-1].duration
                # yield b''.join([f.bytes for f in voiced_frames])
                yield b"".join([f.bytes for f in voiced_frames]), (
                    start_frame,
                    end_frame,
                )
                ring_buffer.clear()
                voiced_frames = []
    #     if triggered:
    #         sys.stdout.write('-(%s)' % (frame.timestamp + frame.duration))
    #     sys.stdout.write('\n')
    # If we have any leftover voiced audio when we run out of input,
    # yield it.
    if voiced_frames:
        start_frame = voiced_frames[0].timestamp
        end_frame = voiced_frames[-1].timestamp + voiced_frames[-1].duration
        yield b"".join([f.bytes for f in voiced_frames]), (start_frame, end_frame)


def vad_collector(sample_rate, frame_duration_ms, padding_duration_ms, vad, audio_bytes):
    num_padding_frames = int(padding_duration_ms / frame_duration_ms)
    # We use a deque for our sliding window/ring buffer.
    ring_buffer = collections.deque(maxlen=num_padding_frames)
    # We have two states: TRIGGERED and NOTTRIGGERED. We start in the
    # NOTTRIGGERED state.
    triggered = False

    voiced_frames = []
    for frame in frame_generator(frame_duration_ms, audio_bytes, sample_rate):
        is_speech = vad.is_speech(frame.bytes, sample_rate)

        if not triggered:
            ring_buffer.append((frame, is_speech))
            num_voiced = len([f for f, speech in ring_buffer if speech])
            # If we're NOTTRIGGERED and more than 90% of the frames in
            # the ring buffer are voiced frames, then enter the
            # TRIGGERED state.
            if num_voiced > 0.9 * ring_buffer.maxlen:
                triggered = True
                # We want to yield all the audio we see from now until
                # we are NOTTRIGGERED, but we have to start with the
                # audio that's already in the ring buffer.
                for f, s in ring_buffer:
                    voiced_frames.append(f)
                ring_buffer.clear()
        else:
            # We're in the TRIGGERED state, so collect the audio data
            # and add it to the ring buffer.
            voiced_frames.append(frame)
            ring_buffer.append((frame, is_speech))
            num_unvoiced = len([f for f, speech in ring_buffer if not speech])
            # If more than 90% of the frames in the ring buffer are
            # unvoiced, then enter NOTTRIGGERED and yield whatever
            # audio we've collected.
            if (
                (num_unvoiced > 0.9 * ring_buffer.maxlen)
                or (
                    len(voiced_frames) > (15000 / 30)
                    and num_unvoiced > 0.85 * ring_buffer.maxlen
                )
                or (
                    len(voiced_frames) > (20000 / 30)
                    and num_unvoiced > 0.75 * ring_buffer.maxlen
                )
                or (
                    len(voiced_frames) > (25000 / 30)
                    and num_unvoiced > 0.65 * ring_buffer.maxlen
                )
            ):
                triggered = False

                start_frame = voiced_frames[0].timestamp
                end_frame = voiced_frames[-1].timestamp + voiced_frames[-1].duration
                # yield b''.join([f.bytes for f in voiced_frames])
                yield b"".join([f.bytes for f in voiced_frames]), (
                    start_frame,
                    end_frame,
                )

                ring_buffer.clear()
                voiced_frames = []
    # If we have any leftover voiced audio when we run out of input,
    # yield it.
    if voiced_frames:
        start_frame = voiced_frames[0].timestamp
        end_frame = voiced_frames[-1].timestamp + voiced_frames[-1].duration
        yield b"".join([f.bytes for f in voiced_frames]), (start_frame, end_frame)


def webrtc_vad_chunking(vad_level: int, chunk_size: int, raw_audio_bytes: bytes, sample_rate: int):
    chunk_size = int(chunk_size)
    vad = webrtcvad.Vad(vad_level)
    for i, (segment, (start_frame, end_frame)) in enumerate(
        vad_collector(sample_rate, 30, 300, vad, raw_audio_bytes)
    ):
        audio_chunk = AudioSegment.from_raw(
            io.BytesIO(segment), sample_width=2, frame_rate=sample_rate, channels=1
        )
        samples = audio_chunk.get_array_of_samples()
        raw_audio = np.array(samples).T.astype(np.float64)
        raw_audio /= np.iinfo(samples.typecode).max
        raw_audio = raw_audio.reshape(-1)

        num_audio_chunks = int(np.ceil(len(raw_audio) / sample_rate / chunk_size))
        if num_audio_chunks > 1:
            for i in range(num_audio_chunks):
                yield raw_audio[
                    chunk_size * i * sample_rate : (i + 1) * chunk_size * sample_rate
                ]
        else:
            yield raw_audio


import os

import torch

model, silero_utils = torch.hub.load(
    repo_or_dir=os.environ.get("VAD_DIR", "/root/.cache/torch/hub/snakers_silero_vad"),
    model="silero_vad",
    # force_reload=True,
    source="local",
    onnx=False,
)
(
    get_speech_timestamps,
    save_audio,
    read_audio,
    VADIterator,
    collect_chunks,
) = silero_utils


def silero_vad_chunking(raw_audio: np.ndarray, sample_rate: int, max_chunk_duration_s: float, min_chunk_duration_s: float = None, min_speech_duration_ms: int = 100):
    wav = torch.from_numpy(raw_audio).float()
    speech_timestamps = get_speech_timestamps(wav, model, sampling_rate=sample_rate, threshold=0.3, min_silence_duration_ms=400, speech_pad_ms=200, min_speech_duration_ms=min_speech_duration_ms)

    if not speech_timestamps:
        return

    # Add metadata in seconds
    for speech_dict in speech_timestamps:
        speech_dict['start_secs'] = round(speech_dict['start'] / sample_rate, 3)
        speech_dict['end_secs'] = round(speech_dict['end'] / sample_rate, 3)
    
    curr_start = speech_timestamps[0]['start']
    curr_end = speech_timestamps[0]['end']
    curr_start_secs = speech_timestamps[0]['start_secs']
    curr_end_secs = speech_timestamps[0]['end_secs']

    for i in range(1, len(speech_timestamps)):
        if min_chunk_duration_s and \
            curr_end_secs - speech_timestamps[i]['start_secs'] < 3 \
            and speech_timestamps[i]['end_secs'] - curr_start_secs <= min_chunk_duration_s:

            curr_end_secs = speech_timestamps[i]['end_secs']
            curr_end = speech_timestamps[i]['end']
        else:
            raw_audio = wav[curr_start : curr_end].numpy()
            for audio_chunk in windowed_chunking(raw_audio, sample_rate, max_chunk_duration_s):
                yield audio_chunk

            curr_start = speech_timestamps[i]['start']
            curr_end = speech_timestamps[i]['end']
            curr_start_secs = speech_timestamps[i]['start_secs']
            curr_end_secs = speech_timestamps[i]['end_secs']

    raw_audio = wav[curr_start : curr_end].numpy()
    for audio_chunk in windowed_chunking(raw_audio, sample_rate, max_chunk_duration_s):
        yield audio_chunk

def windowed_chunking(raw_audio: np.ndarray, sample_rate: int, max_chunk_duration_s: float):
    num_audio_chunks = int(np.ceil(len(raw_audio) / sample_rate / max_chunk_duration_s))
    if num_audio_chunks > 1:
        for chunk_idx in range(num_audio_chunks):
            yield raw_audio[
                max_chunk_duration_s * chunk_idx * sample_rate : (chunk_idx + 1) * max_chunk_duration_s * sample_rate
            ]
    else:
        yield raw_audio

def download_audio(url: str):
    if "youtube.com" in url or "youtu.be" in url or "drive.google/com" in url:
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
