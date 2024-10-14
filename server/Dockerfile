FROM python:3.10 as base

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y libsndfile1 libsndfile1-dev ffmpeg

WORKDIR /src
COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install "torchaudio==2.4.1"

COPY . /src
RUN chmod -R 777 /src