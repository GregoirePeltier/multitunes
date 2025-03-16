import base64
import json

from flask import Flask, request

from app.track_processing_request import TrackProcessingRequest
from app.track_processor import TrackProcessor

app = Flask(__name__)


@app.route("/", methods=["POST"])
def index():
    """Receive and parse Pub/Sub messages."""
    envelope = request.get_json()
    if not envelope:
        msg = "no Pub/Sub message received"
        print(f"error: {msg}")
        return f"Bad Request: {msg}", 400

    if not isinstance(envelope, dict) or "message" not in envelope:
        msg = "invalid Pub/Sub message format"
        print(f"error: {msg}")
        return f"Bad Request: {msg}", 400

    pubsub_message = envelope["message"]


    if isinstance(pubsub_message, dict) and "data" in pubsub_message:
        return handle_pubsub_message(pubsub_message)

    return ("", 204)


def handle_pubsub_message(cloud_event):
    """Triggered from a Pub/Sub message."""
    try:
        # Get the message data from the Pub/Sub event
        pubsub_message = base64.b64decode(cloud_event["data"]).decode()
        message_data = json.loads(pubsub_message)

        # Validate and parse the message using ProcessTrackRequest model
        validated_data = TrackProcessingRequest(**message_data)
        track_processor = TrackProcessor(validated_data)
        track_processor.process()
        return 200

    except Exception as e:
            print(f"Error processing message: {str(e)}")
            raise
