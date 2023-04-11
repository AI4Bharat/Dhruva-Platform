import io
import collections
import webrtcvad
import numpy as np
from pydub import AudioSegment

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

def vad_collector_old(sample_rate, frame_duration_ms, padding_duration_ms, vad, fp_arr):
    num_padding_frames = int(padding_duration_ms / frame_duration_ms)
    # We use a deque for our sliding window/ring buffer.
    ring_buffer = collections.deque(maxlen=num_padding_frames)
    # We have two states: TRIGGERED and NOTTRIGGERED. We start in the
    # NOTTRIGGERED state.
    triggered = False

    voiced_frames = []
    for frame in frame_generator(frame_duration_ms, fp_arr, sample_rate):
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


def vad_collector(sample_rate, frame_duration_ms, padding_duration_ms, vad, fp_arr):
    num_padding_frames = int(padding_duration_ms / frame_duration_ms)
    # We use a deque for our sliding window/ring buffer.
    ring_buffer = collections.deque(maxlen=num_padding_frames)
    # We have two states: TRIGGERED and NOTTRIGGERED. We start in the
    # NOTTRIGGERED state.
    triggered = False

    voiced_frames = []
    for frame in frame_generator(frame_duration_ms, fp_arr, sample_rate):
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
            if (num_unvoiced > 0.9 * ring_buffer.maxlen) or (len(voiced_frames)
                 > (15000/30) and num_unvoiced > 0.85 * ring_buffer.maxlen) or (len(voiced_frames)
                 > (20000/30) and num_unvoiced > 0.75 * ring_buffer.maxlen) or (len(voiced_frames)
                 > (25000/30) and num_unvoiced > 0.65 * ring_buffer.maxlen):
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

def webrtc_vad_chunking(vad_level, chunk_size, fp_arr, sample_rate):
    chunk_size = int(chunk_size)
    vad = webrtcvad.Vad(vad_level)
    for i, (segment, (start_frame, end_frame)) in enumerate(
        vad_collector(sample_rate, 30, 300, vad, fp_arr)
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
                    chunk_size * i * sample_rate: (i + 1) * chunk_size * sample_rate
                ]
        else:
            yield raw_audio


import torch
model, silero_utils = torch.hub.load(
    repo_or_dir='snakers4/silero-vad',
    model='silero_vad',
    # force_reload=True,
    onnx=False
)

(get_speech_timestamps,
 save_audio,
 read_audio,
 VADIterator,
 collect_chunks) = silero_utils

def silero_vad_chunking(raw_audio, sample_rate, chunk_size):
    wav = torch.from_numpy(raw_audio).float()
    speech_timestamps = get_speech_timestamps(wav, model, sampling_rate=sample_rate)
    for i in speech_timestamps:
        raw_audio = wav[i['start']: i['end']].numpy()
        num_audio_chunks = int(np.ceil(len(raw_audio) / sample_rate / chunk_size))
        if num_audio_chunks > 1:
            for i in range(num_audio_chunks):
                yield raw_audio[
                    chunk_size * i * sample_rate: (i + 1) * chunk_size * sample_rate
                ]
        else:
            yield raw_audio
