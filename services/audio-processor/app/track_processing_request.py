from pydantic import BaseModel


class TrackProcessingRequest(BaseModel):
    track_quizz_audio_id: int
    jwt_token: str
