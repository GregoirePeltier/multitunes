import os

import requests


class CoreApiService:

    def __init__(self, jwt_token: str):
        self.jwt_token = jwt_token
        self.root_url = os.environ["CORE_API_URL"]

    def get_track(self, track_id: int):
        """Query the backend for a track in JSON"""
        response = requests.get(
            f"{self.root_url}/api/tracks/{track_id}",
            headers=self.get_base_headers()
        )
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to fetch track {track_id}: {response.status_code} - {response.text}")

    def get_track_quiz_audio(self, id: int):
        response = requests.get(
            f"{self.root_url}/api/trackaudios/{id}",
            headers=self.get_base_headers()
        )
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to fetch track audio {id}: {response.status_code} - {response.text}")

    def get_base_headers(self):
        return {"Authorization": f"Bearer {self.jwt_token}"}

    def update_quiz_audio(self, quizz_audio_id: int, update_data: dict):
        response = requests.put(
            f"{self.root_url}/api/trackaudios/{quizz_audio_id}",
            headers=self.get_base_headers(),
            json=update_data
        )
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to update quiz audio {quizz_audio_id}: {response.status_code} - {response.text}")
