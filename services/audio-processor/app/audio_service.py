import requests

DEEZER = "deezer"


class AudioService:
    def get_deezer_preview_url(self, track_id):
        track_url = f"https://api.deezer.com/track/{track_id}"
        try:
            response = requests.get(track_url)
            response.raise_for_status()
            track_data = response.json()
            if "preview" not in track_data:
                raise KeyError(f"'preview' not found in Deezer API response for track_id {track_id}")
            return track_data["preview"]
        except Exception as e:
            raise Exception(f"Failed to fetch or parse preview URL from Deezer API: {e}")

    def get_audio_url(self, track):
        track_source = track["trackSource"]
        if track_source["source"] == DEEZER:
            return self.get_deezer_preview_url(track_source["sourceId"])
        else:
            raise Exception("Unknown track source {}".format(track_source["source"]))

    def download_audio(self, audio_url, input_path):
        response = requests.get(audio_url, stream=True)
        if response.status_code == 200:
            with open(input_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
        else:
            raise Exception(f"Failed to download preview: {response.status_code}")


