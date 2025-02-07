import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock
import redis.asyncio as redis
from google.cloud import storage
import json
from app.main import app, ProcessingJob

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_redis():

    mock = Mock(spec=redis.Redis)
    mock.hset = AsyncMock()
    mock.hget = AsyncMock()
    mock.pubsub = AsyncMock()
    mock.pubsub.return_value = Mock(spec=redis.client.PubSub)
    return mock

@pytest.fixture
def mock_gcs():
    mock = Mock(spec=storage.Client)
    mock.bucket.return_value.blob.return_value.upload_from_filename = Mock()
    mock.bucket.return_value.blob.return_value.make_public = Mock()
    mock.bucket.return_value.blob.return_value.public_url = "https://storage.googleapis.com/test/test.wav"
    return mock

@pytest.fixture
def mock_demucs():
    mock = Mock()
    mock.sources = ['drums', 'bass', 'vocals', 'other']
    mock.cuda = Mock(return_value=mock)
    mock.cpu = Mock(return_value=mock)
    return mock
