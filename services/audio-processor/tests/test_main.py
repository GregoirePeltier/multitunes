import pytest
from fastapi.testclient import TestClient
import json
import tempfile
import os
from pathlib import Path
from unittest.mock import patch, AsyncMock, Mock, MagicMock
from app.main import ProcessingJob
import shutil


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


@pytest.mark.asyncio
async def test_process_job(mock_redis, mock_gcs, mock_demucs):
    with patch('app.main.redis_client', mock_redis), \
            patch('app.main.storage_client', mock_gcs), \
            patch('app.main.get_demucs_model', return_value=mock_demucs), \
            patch('app.main.download_preview'), \
            patch('app.main.process_audio', return_value={'drums': 'test.wav'}), \
            patch('app.main.upload_to_gcs', return_value='https://test.com/audio.wav'):

        job = ProcessingJob(
            jobId="test-job-1",
            trackId=123,
            preview="http://example.com/test.mp3"
        )

        from app.main import process_job
        await process_job(job)

        # Verify Redis interactions
        # The job should now be processing
        mock_redis.hset.assert_any_call(
            f"job:{job.job_id}", "status", "processing")
        # The audio processing should have been triggered with the file path
        from app.main import process_audio,upload_to_gcs
        process_audio.assert_called()
        upload_to_gcs.assert_any_call(f"test.wav","stems/123/drums.mp3")
        
        mock_redis.hset.assert_called_with(f"job:{job.job_id}",
                                           mapping={
                                               "status": "completed",
                                               "instruments": json.dumps({"drums":"https://test.com/audio.wav"})
                                           })


@pytest.mark.asyncio
async def test_download_preview():
    with tempfile.TemporaryDirectory() as temp_dir:
        test_file = Path(temp_dir) / "test.mp3"
        mock_session = MagicMock()
        mock_response = MagicMock()

        # Configure the response
        mock_response.status = 200
        mock_response.read = AsyncMock(return_value=b"test")
        mock_response.__aenter__.return_value = mock_response
        mock_response.__aexit__.return_value = None
        # Configure the session's get method to return response
        mock_session.get.return_value = mock_response
        mock_session.__aenter__ = AsyncMock(return_value = mock_session)
        mock_session.__aexit__.return_value = False
        with patch('aiohttp.ClientSession', return_value=mock_session):
            from app.main import download_preview
            await download_preview("http://example.com/test.mp3", str(test_file))
            assert test_file.exists()


@pytest.mark.asyncio
async def test_process_audio():
    with tempfile.TemporaryDirectory() as temp_dir:
        test_file = Path(temp_dir) / "test.mp3"
        shutil.copy("test_audio/test_audio_1.mp3", test_file)
        from app.main import process_audio
        mock_update = Mock()
        stems = process_audio(str(test_file), temp_dir,mock_update)
        assert stems["drums"] == (Path(temp_dir) / "drums.mp3")
        for file in stems.values():
            assert os.path.exists(file),f"{file} does not exist"
        mock_update.assert_called()
