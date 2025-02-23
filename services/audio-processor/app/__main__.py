import fire
from typing import Optional
import os
from dataclasses import dataclass

from app.track_processing_request import TrackProcessingRequest
from app.track_processor import TrackProcessor


@dataclass
class LocalTrackProcessingRequest:
    """Data class to hold track processing parameters"""
    input_file: str
    output_dir: str
    stems: Optional[list] = None
    preview_duration: Optional[int] = 30


class AudioProcessingCLI:
    """CLI for local audio processing"""

    def process(self,
                quizz_id: int,
                jwt_token: str):
        """
        Processes a quizz audio track in the database

        Args:
            audio_id: The quizzes audio id in the database
            jwt_token: A valid JWT token for the used backend
        """

        # Initialize processor
        processor = TrackProcessor(TrackProcessingRequest(
            track_quizz_audio_id=quizz_id,jwt_token=jwt_token
        ))

        # Process the track
        processor.process()
        print("Procesing complete")


def main():
    fire.Fire(AudioProcessingCLI)


if __name__ == "__main__":
    main()