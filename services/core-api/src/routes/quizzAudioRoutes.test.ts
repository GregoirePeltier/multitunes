import request from "supertest";
import express, {Express} from "express";
import {TrackQuizAudioController} from "../controllers/trackQuizAudioController";
import {trackQuizAudioRoutes} from "./quizzAudioRoutes";

jest.mock("../middleware/auth", () => ({
    authenticateToken: jest.fn((req, res, next) => next()),
}));

describe("trackQuizAudioRoutes", () => {
    let app: Express;
    let controller: jest.Mocked<TrackQuizAudioController>;

    beforeEach(() => {
        controller = {
            create: jest.fn(),
            getAll: jest.fn(),
            update: jest.fn(),
            getNotPreparedTracks: jest.fn(),
            get: jest.fn(),
        } as unknown as jest.Mocked<TrackQuizAudioController>;

        app = express();
        app.use(express.json());
        app.use("/quizz-audio", trackQuizAudioRoutes(controller));
    });

    describe("POST /quizz-audio", () => {
        it("should create a new track quiz audio", async () => {
            const mockRequestBody = {
                audioUrl: "http://audio.url",
                trackId: 2,
                stemsStarts: [["vocals", 10]],
                prepared:false,
                audioTreatmentVersion:1,
                questionId:1,
            };
            const mockResponse = {id: 1, ...mockRequestBody};
            controller.create.mockResolvedValue(mockResponse as any);

            const response = await request(app).post("/quizz-audio").send(mockRequestBody);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockResponse);
            expect(controller.create).toHaveBeenCalledWith(mockRequestBody);
        });

        it("should return 400 when creation fails", async () => {
            controller.create.mockRejectedValue(new Error("Create failed"));

            const response = await request(app).post("/quizz-audio").send({});
            expect(response.status).toBe(400);
            expect(response.body).toEqual({error: "Create failed"});
        });
    });

    describe("GET /quizz-audio", () => {
        it("should get all track quiz audios", async () => {
            const mockResponse = [{id: 1, audioUrl: "http://audio.url"}];
            controller.getAll.mockResolvedValue(mockResponse as any);

            const response = await request(app).get("/quizz-audio");
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(controller.getAll).toHaveBeenCalled();
        });

        it("should return 400 when fetching fails", async () => {
            controller.getAll.mockRejectedValue(new Error("Fetch failed"));

            const response = await request(app).get("/quizz-audio");
            expect(response.status).toBe(400);
            expect(response.body).toEqual({error: "Fetch failed"});
        });
    });

    describe("PUT /quizz-audio/:id", () => {
        it("should update a track quiz audio", async () => {
            const mockRequestBody = {
                audioUrl: "http://updated.audio.url",
                "audioTreatmentVersion": 2,
                prepared: true,
                questionId: 2,
                trackId: 2,
                stemsStarts: [["bass", 20]],
            };
            const mockResponse = {id: 1, ...mockRequestBody};
            controller.update.mockResolvedValue(mockResponse as any);

            const response = await request(app).put("/quizz-audio/1").send(mockRequestBody);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(controller.update).toHaveBeenCalledWith("1", mockRequestBody);
        });

        it("should return 400 when update fails", async () => {
            controller.update.mockRejectedValue(new Error("Update failed"));

            const response = await request(app).put("/quizz-audio/1").send({});
            expect(response.status).toBe(400);
            expect(response.body).toEqual({error: "Update failed"});
        });
    });

    describe("GET /quizz-audio/not-prepared", () => {
        it("should get all not prepared track quiz audios", async () => {
            const mockResponse = [{id: 1, prepared: false}];
            controller.getNotPreparedTracks.mockResolvedValue(mockResponse as any);

            const response = await request(app).get("/quizz-audio/not-prepared");
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(controller.getNotPreparedTracks).toHaveBeenCalled();
        });

        it("should return 400 when fetching not prepared tracks fails", async () => {
            controller.getNotPreparedTracks.mockRejectedValue(new Error("Fetch failed"));

            const response = await request(app).get("/quizz-audio/not-prepared");
            expect(response.status).toBe(400);
            expect(response.body).toEqual({error: "Fetch failed"});
        });
    });
});