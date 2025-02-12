import {validateTrackData} from './trackValidators';
import {NextFunction, Request, Response} from 'express';
import {SourceValues} from "../models/TrackSource";

describe('validateTrackData', () => {
    let mockRequest: (body: any) => Partial<Request>;
    let mockResponse: () => Partial<Response<any, Record<string, any>>>;
    let mockNext: NextFunction;

    beforeEach(()=>{
        mockRequest = (body: any): Partial<Request> => ({
        body,
    });
    mockResponse = () => {
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;

    };
    mockNext = jest.fn();
    })

    it('should call next when valid data is provided', () => {
        const req = mockRequest({
            title: 'Song Title',
            artist: 'Artist Name',
            preview: 'preview.mp3',
            cover: 'cover.jpg',
        }) as Request;
        const res = mockResponse() as Response;

        validateTrackData(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', () => {
        const req = mockRequest({
            artist: 'Artist Name',
            preview: 'preview.mp3',
            cover: 'cover.jpg',
        }) as Request;
        const res = mockResponse() as Response;

        validateTrackData(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Title, artist, preview, and cover are required',
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 if source is invalid', () => {
        const req = mockRequest({
            title: 'Song Title',
            artist: 'Artist Name',
            preview: 'preview.mp3',
            cover: 'cover.jpg',
            source: 'invalidSource',
        }) as Request;
        const res = mockResponse() as Response;

        validateTrackData(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Source must be one of: ' + SourceValues.join(', '),
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 if sourceUrl and sourceId are missing when source is present', () => {
        const req = mockRequest({
            title: 'Song Title',
            artist: 'Artist Name',
            preview: 'preview.mp3',
            cover: 'cover.jpg',
            source: SourceValues[0],
        }) as Request;
        const res = mockResponse() as Response;

        validateTrackData(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Source URL and Source ID are required when source is provided',
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next when source, sourceUrl, and sourceId are all valid', () => {
        const req = mockRequest({
            title: 'Song Title',
            artist: 'Artist Name',
            preview: 'preview.mp3',
            cover: 'cover.jpg',
            source: SourceValues[0],
            sourceUrl: 'https://example.com',
            sourceId: '123',
        }) as Request;
        const res = mockResponse() as Response;

        validateTrackData(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});