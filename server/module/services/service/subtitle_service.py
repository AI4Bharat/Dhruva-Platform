from typing import Dict, List, Tuple


class SubtitleService:
    def get_srt_subtitle(self, transcript_lines: List[Tuple[str, Dict[str, float]]]):
        string = ""

        for idx, (line, timestamp) in enumerate(transcript_lines):
            start_timestamp = self.__convert_to_srt_timestamp(timestamp["start_secs"])
            end_timestamp = self.__convert_to_srt_timestamp(timestamp["end_secs"])
            line = (
                f"{idx + 1}\n{start_timestamp} --> {end_timestamp}\n{line.strip()}\n\n"
            )
            string += line

        return string

    def get_webvtt_subtitle(self, transcript_lines: List[Tuple[str, Dict[str, float]]]):
        string = "WEBVTT\n\n"

        for idx, (line, timestamp) in enumerate(transcript_lines):
            start_timestamp = self.__convert_to_webvtt_timestamp(
                timestamp["start_secs"]
            )
            end_timestamp = self.__convert_to_webvtt_timestamp(timestamp["end_secs"])
            line = f"{idx + 1}\n{start_timestamp} --> {end_timestamp}\n- {line.strip()}\n\n"
            string += line

        return string

    def __convert_to_srt_timestamp(self, timestamp: float):
        hour, minute, second, milli = self.__get_time_parts(timestamp)

        return "{}:{}:{},{}".format(
            hour if hour > 9 else f"0{hour}",
            ((2 - len(str(minute))) * "0") + str(minute),
            ((2 - len(str(second))) * "0") + str(second),
            ((3 - len(str(milli))) * "0") + str(milli),
        )

    def __convert_to_webvtt_timestamp(self, timestamp: float):
        hour, minute, second, milli = self.__get_time_parts(timestamp)

        return "{}:{}:{}.{}".format(
            hour if hour > 9 else f"0{hour}",
            ((2 - len(str(minute))) * "0") + str(minute),
            ((2 - len(str(second))) * "0") + str(second),
            ((3 - len(str(milli))) * "0") + str(milli),
        )

    def __get_time_parts(self, timestamp: float):
        hour = int(timestamp // 3600)
        timestamp -= hour * 3600
        minute = int(timestamp // 60)
        timestamp -= minute * 60
        second = int(timestamp)
        timestamp -= second
        milli = int(timestamp * 1000)

        return (hour, minute, second, milli)
