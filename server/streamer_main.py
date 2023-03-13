from fastapi import FastAPI
from seq_streamer import StreamingServerTaskSequence

app = FastAPI()
streamer = StreamingServerTaskSequence()
# Mount it at the default path of SocketIO engine
app.mount("/socket.io", streamer.app)

## TEMPORARY ##

# TODO: Depreciate this soon in-favor of above
from asr_streamer import StreamingServerASR
streamer_asr = StreamingServerASR()

# Mount it at an alternative path. 
app.mount("/socket_asr.io", streamer_asr.app)
