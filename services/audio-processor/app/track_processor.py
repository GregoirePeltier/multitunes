import os
import tempfile
from pathlib import Path

import demucs.api
from pydub import AudioSegment

from app.FileStorageService import FileStorageService
from app.audio_service import AudioService
from app.core_api_service import CoreApiService
from app.logger import logger
from app.track_processing_request import TrackProcessingRequest


class TrackProcessor:
    def __init__(self, request: TrackProcessingRequest) -> None:
        self.storage_service = FileStorageService()
        self.track_quizz_audio_id: int = request.track_quizz_audio_id
        self.jwt_token: str = request.jwt_token
        self.core_service: CoreApiService = CoreApiService(request.jwt_token)
        self.audio_service: AudioService = AudioService()

    def get_audio_url(self) -> str:
        """Fetch the audio URL for the given track quiz audio ID using CoreApiService"""
        audio_info: dict = self.core_service.get_track_quiz_audio(self.track_quizz_audio_id)
        track: dict = self.core_service.get_track(audio_info["trackId"])
        return self.audio_service.get_audio_url(track)

    def process(self) -> None:
        """
        Downloads, Split, Merge, and Upload the resulting audio file to GCS.
        """
        logger.info(f"Starting processing audio {self.track_quizz_audio_id}")
        audio_url: str = self.get_audio_url()
        if not audio_url:
            raise ValueError(f"Could not get initial audio URL for {self.track_quizz_audio_id}")
        stem_timings: dict = self.get_stem_timings()
        if not stem_timings:
            raise ValueError(f"Could not get stem timings for {self.track_quizz_audio_id}")
        with tempfile.TemporaryDirectory() as temp_dir:
            # Download preview
            input_path: str = os.path.join(temp_dir, "input.mp3")
            self.download_preview(audio_url, input_path)
            logger.info("Downloaded, processing audio")
            # Process audio
            stem_paths: dict = self.process_audio(input_path, temp_dir)
            logger.info("Stems generated, merging")
            merged_path = Path(os.path.join(temp_dir, "merged.mp3"))
            self.merge_audio(stem_paths, stem_timings,merged_path)
            logger.info("Merged, uploading")
            public_url = self.upload(merged_path)
            logger.info("Uploaded audio")
            self.update_audio(public_url)
            logger.info(f"Finished processing audio {self.track_quizz_audio_id}")

    def get_stem_timings(self) -> dict:
        quiz_audio: dict = self.core_service.get_track_quiz_audio(self.track_quizz_audio_id)
        timings: list = quiz_audio["quizAudioStartTimes"]
        return {timing["stem"]: timing["startTime"] for timing in timings}

    def download_preview(self, audio_url, input_path):
        self.audio_service.download_audio(audio_url, input_path)

    def process_audio(self, input_path, output_dir):
        """Split audio into stems using Demucs"""
        def separation_callback(data):
            progress = data["segment_offset"] / data["audio_length"] * 100
            logger.info(f"Separation progress: {progress}")

        logger.info(f"Processing audio file")
        separator = demucs.api.Separator(model="htdemucs_6s", callback=separation_callback)
        logger.info(f"Loaded Demucs model")
        origin, separated = separator.separate_audio_file(Path(input_path))
        logger.info(f"Separated audio")
        stems = dict()
        output_dir = Path(output_dir)
        if not output_dir.exists():
            output_dir.mkdir(parents=True)
        for stem, source in separated.items():
            logger.info(f"Saving {stem} to {output_dir}")
            saved_path = output_dir.joinpath(f"{stem}.mp3")
            demucs.api.save_audio(source, saved_path, bitrate=320, samplerate=separator.samplerate, preset=2)
            stems[stem] = saved_path
        logger.info(f"Saved stems to {output_dir}")
        return stems

    def merge_audio(self, stem_paths:dict, stem_timings:dict,output_path:Path):
        """
        Merge 6 audio tracks by muting each audio track until its corresponding timing is reached,
        combining them into a single audio track, and exporting the result to a specified path.

        Args:
            stem_paths (list): List of file paths to the audio tracks.
            stem_timings (list): List of timing offsets (in seconds) for each track.
            output_path (Path): Path where the merged audio track will be saved.

        Returns:
            bool: True if the track is successfully merged and saved, False otherwise.
        """

        # Merge the tracks using the previously defined function
        # Load all audio tracks and adjust their volume to zero before the specified timing
        processed_tracks = []
        for track, timing in [(stem_paths[stem],stem_timings[stem]) for stem in stem_timings]:
            audio = AudioSegment.from_file(track)
            muted_audio = audio[:timing * 1000] - 100  # Reduce the volume to silence
            processed_track = muted_audio + audio[timing * 1000:]
            processed_tracks.append(processed_track)

        # Overlay audio tracks together
        merged_track = processed_tracks[0]
        for track in processed_tracks[1:]:
            merged_track = merged_track.overlay(track)


        # Export the merged track to the specified output path
        merged_track.export(output_path, format="mp3", bitrate="320k", parameters=["-ac", "2"])

    def upload(self, merged_path:Path):
        trackId = self.core_service.get_track_quiz_audio(self.track_quizz_audio_id)["trackId"]
        location = f"audios/{trackId}/merged.mp3"
        return self.storage_service.upload_public(location, merged_path)

    def update_audio(self, public_url:str):
        self.core_service.update_quiz_audio(self.track_quizz_audio_id,{
            "prepared": True,
            "audioUrl": public_url,
        })



