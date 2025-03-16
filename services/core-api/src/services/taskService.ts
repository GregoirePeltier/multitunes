// Imports the Google Cloud client library
import {PubSub} from '@google-cloud/pubsub';
import {generateToken} from "../middleware/auth";

// Creates a client; cache this for further use
const pubSubClient = new PubSub(
    {
        projectId: process.env.GCP_PROJECT_ID,
        apiEndpoint: process.env.PUBSUB_EMULATOR_HOST
    }
);
const AUDIO_PROCESSING_TOPIC = 'audio-processing-jobs';

const audioProcessingTopic = pubSubClient.topic(AUDIO_PROCESSING_TOPIC);
audioProcessingTopic.exists().then(async exists => {
    if (!exists[0]) {
        console.log("Topic does not exist:")
        await audioProcessingTopic.create()
        console.log("Topic created")
        return
    }
    console.log("Topic exists")
}).catch(err => {
    console.error(`Failed to get topic: ${err}`)
    process.exit(1)
})


export class AudioTaskService {
    async processAudio(audioId: number) {

        const token = generateToken({"source": "processAudio"}, 60 * 60 * 24)
        const data = JSON.stringify({audioId, jwt_token: token});
        const dataBuffer = Buffer.from(data);
        try {
            const messageId = await audioProcessingTopic.publishMessage({data: dataBuffer});
            console.log(`Message ${messageId} published.`);
        } catch (error) {
            console.error(
                `Received error while publishing: ${(error as Error).message}`
            );
        }
    }
}
