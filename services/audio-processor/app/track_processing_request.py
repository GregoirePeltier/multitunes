from pydantic import BaseModel, Field


class TrackProcessingRequest(BaseModel):
    track_quizz_audio_id: int = Field(validation_alias="audioId")
    jwt_token: str
