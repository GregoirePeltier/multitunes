from pathlib import Path

from pydub import AudioSegment
from typing import List


def merge_audio_tracks_with_timings(tracks: List[Path], timings: List[int]) -> AudioSegment:
    """
    Merge 6 audio tracks by setting each track's volume to zero until its corresponding timing is reached
    and combining them into a single audio track.

    Args:
        tracks (list): List of 6 file paths to the audio tracks.
        timings (list): List of timing offsets (in seconds) for each track.

    Returns:
        AudioSegment: The merged audio track.
    """
    assert len(tracks) == len(timings), "Invalid number of tracks or timings."

    # Load all audio tracks and adjust their volume to zero before the specified timing
    processed_tracks = []
    for track, timing in zip(tracks, timings):
        audio = AudioSegment.from_file(track)
        muted_audio = audio[:timing * 1000] - 100  # Reduce the volume to silence
        processed_track = muted_audio + audio[timing * 1000:]
        processed_tracks.append(processed_track)

    # Overlay audio tracks together
    merged_track = processed_tracks[0]
    for track in processed_tracks[1:]:
        merged_track = merged_track.overlay(track)

    return merged_track


def merge_tracks_into(tracks: List[Path], timings: List[int], output_path: Path) -> bool:
    """
    Merge 6 audio tracks by muting each audio track until its corresponding timing is reached,
    combining them into a single audio track, and exporting the result to a specified path.

    Args:
        tracks (list): List of file paths to the audio tracks.
        timings (list): List of timing offsets (in seconds) for each track.
        output_path (Path): Path where the merged audio track will be saved.

    Returns:
        bool: True if the track is successfully merged and saved, False otherwise.
    """
    try:
        assert len(tracks) == len(timings) , "Invalid number of tracks or timings."

        # Merge the tracks using the previously defined function
        merged_track = merge_audio_tracks_with_timings(tracks, timings)

        # Export the merged track to the specified output path
        merged_track.export(output_path, format="mp3", bitrate="320k", parameters=["-ac", "2"])

        return True
    except Exception as e:
        print(f"Error merging tracks: {e}")
        return False
