import base64
import os
from functools import cached_property
import json

import requests
from dotenv import load_dotenv
from fire import Fire
from google.cloud import pubsub_v1
from sympy import public
from torch.distributed.elastic.metrics import publish_metric
load_dotenv()


def forward_to_service(message):
    print("Relaying to service...",message)

    service_url = os.environ["DEV_SERVICE_URL"]  # Your local Cloud Run service
    # Format message like Cloud Pub/Sub would
    forwarded_message = {
        "message": {
            "data": base64.b64encode(message.data).decode('utf-8'),
            "messageId": message.message_id,
            "publishTime": message.publish_time.isoformat()
        },
    }

    try:
        response = requests.post(service_url, json=forwarded_message)
        if response.status_code == 200:
            message.ack()
        else:
            message.nack()
    except requests.exceptions.RequestException:
        message.nack()


class DevPubSub:
    def create_topic(self, topic_name):
        publisher = self.publisher
        topic_path = publisher.topic_path(self.project_id, topic_name)
        topic = publisher.create_topic(request={"name": topic_path})
        print(f"Created topic: {topic.name}")

    def list_topics(self):
        """Lists all available topics for the current project."""
        publisher = self.publisher
        project_path = f"projects/{self.project_id}"
        topics = publisher.list_topics(request={"project": project_path})
        print("Existing topics:")
        for topic in topics:
            print(topic.name)

    def delete_topic(self,topic_name):
        publisher = self.publisher
        topic_path = publisher.topic_path(self.project_id,topic_name)
        publisher.delete_topic(request={"topic": topic_path})
        print(f"Deleted topic: {topic_path}")

    def publish(self, message):
        print(f"Using the project ID {self.project_id} and topic {self.topic_name}")
        if (os.environ["PUBSUB_EMULATOR_HOST"]):
            print(f"Publishing to emulator host {os.environ['PUBSUB_EMULATOR_HOST']}")
        if not isinstance(message, str):
            message = json.dumps(message)
        print(f"Publishing message to topic {self.topic_name}: {message}")
        publisher = self.publisher
        topic_path = publisher.topic_path(self.project_id, self.topic_name)

        # Publish message
        future = publisher.publish(topic_path, message.encode("utf-8"))
        print(future.result())
        print("Published message")

    def bridge(self,topic_name="audio-processing-jobs"):
        print("Subscribing to topic...")
        subscriber = self.subscriber
        subscription_path = subscriber.subscription_path(self.project_id, 'myRunSubscription')
        topic_path = subscriber.topic_path(self.project_id, topic_name)

        # Ensure subscription exists
        try:
            subscriber.get_subscription(request={"subscription": subscription_path})
        except Exception:
            print("Subscription does not exist. Creating subscription...")
            subscriber.create_subscription(request={"name": subscription_path, "topic": topic_path})

        streaming_pull_future = subscriber.subscribe(subscription_path, forward_to_service)
        print("Subscribed to topic and bridging messages to local service.")
        streaming_pull_future.result()
        print("Done")
    

    @property
    def project_id(self):
        return os.environ["GCP_PROJECT_ID"]
    @property
    def topic_name(self):
        return "audio-processor-jobs"
    @cached_property
    def publisher(self):
        return  pubsub_v1.PublisherClient()
    @cached_property
    def subscriber(self):
        return  pubsub_v1.SubscriberClient()

if __name__ == "__main__":
    Fire(DevPubSub)
