FROM python:3.10 as base

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN apt-get update && apt-get install -y libsndfile1 libsndfile1-dev ffmpeg

WORKDIR /src
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

RUN curl -L -o silero_vad.tar.gz "https://github.com/snakers4/silero-vad/tarball/master"
RUN mkdir -p /root/.cache/torch/hub
RUN tar -xf silero_vad.tar.gz --directory /root/.cache/torch/hub
RUN mv /root/.cache/torch/hub/* /root/.cache/torch/hub/snakers_silero_vad

COPY . /src
RUN chmod -R 777 /src