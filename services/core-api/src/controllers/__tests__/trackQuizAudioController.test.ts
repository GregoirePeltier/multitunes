
import {Repository} from 'typeorm';
import {QuizAudioStartTimes, StemType, TrackQuizAudio} from '../../models/Track'; // Replace with actual path
import {jest} from '@jest/globals';
import {TrackQuizAudioController} from "../trackQuizAudioController";

describe('TrackQuizAudioController', () => {
    let repository: jest.Mocked<Repository<TrackQuizAudio>>;
    let startTimeRepository: jest.Mocked<Repository<QuizAudioStartTimes>>;
    let controller: TrackQuizAudioController;

    beforeEach(() => {
        repository = {
            create: jest.fn(),
            insert: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            manager: {
                transaction: jest.fn(),
            },
        } as any;

        startTimeRepository = {
            create: jest.fn(),
            insert: jest.fn(),
            delete: jest.fn(),
        } as any;

        controller = new TrackQuizAudioController(repository, startTimeRepository);
    });

    describe('create', () => {
        it('should create a new TrackQuizAudio with related start times', async () => {
            const mockData = {
                trackId: 1,
                audioUrl: 'url',
                audioTreatmentVersion: 1,
                prepared: false,
                questionId: 1,
                stemsStarts: [
                    ['vocals', 10],
                    ['drums', 20],
                ] as [StemType, number][],
            };
            const mockAudio = {id: 1, ...mockData, stemsStarts: undefined};

            repository.create.mockReturnValue(mockAudio as any);
            repository.insert.mockResolvedValue({generatedMaps: [{id: 1}]} as any);
            repository.findOne.mockResolvedValue({...mockAudio, quizAudioStartTimes: []} as any);


            const res = await controller.create(mockData);

            expect(repository.create).toHaveBeenCalledWith(mockData);
            expect(repository.insert).toHaveBeenCalledWith(mockAudio);
            expect(startTimeRepository.create).toHaveBeenCalledTimes(2);
            expect(startTimeRepository.insert).toHaveBeenCalledTimes(2);
            expect(repository.findOne).toHaveBeenCalledWith({
                where: {id: 1},
                relations: ['startTimes'],
            });
            expect(res).toEqual({...mockAudio, quizAudioStartTimes: []});
        });
    });

    describe('get', () => {
        it('should return the TrackQuizAudio with the given id', async () => {
            const mockAudio = {id: 1, audioUrl: 'url'};

            repository.findOne.mockResolvedValue(mockAudio as any);

            const res = await controller.get(1);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: {id: 1},
                relations: ['startTimes'],
            });
            expect(res).toEqual(mockAudio);
        });

        it('should throw an error if TrackQuizAudio is not found', async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(controller.get(1)).rejects.toThrow('TrackQuizAudio with id 1 not found');
        });
    });

    describe('getAll', () => {
        it('should return all TrackQuizAudio', async () => {
            const mockAudios = [{id: 1, audioUrl: 'url'}];

            repository.find.mockResolvedValue(mockAudios as any);

            const res = await controller.getAll();

            expect(repository.find).toHaveBeenCalledWith();
            expect(res).toEqual(mockAudios);
        });
    });

    describe('update', () => {
        it('should update and return the TrackQuizAudio', async () => {
            const id = '1';
            const updateData = {audioUrl: 'newUrl', stemsStarts: [['vocals', 30]] as [StemType,number][]};
            const mockAudio = {id: 1, audioUrl: 'newUrl', quizAudioStartTimes: []};

            repository.manager.transaction.mockImplementation(async (callback:any) =>
                callback({
                    findOne: jest.fn().mockImplementation(()=>Promise.resolve(mockAudio)) as any,
                    delete: jest.fn(),
                    create: jest.fn(),
                    insert: jest.fn(),
                    update: jest.fn(),
                })
            );

            const result = await controller.update(id, updateData);

            expect(repository.manager.transaction).toHaveBeenCalled();
            expect(result).toEqual(mockAudio);
        });

        it('should throw an error if TrackQuizAudio is not found', async () => {
            repository.manager.transaction.mockImplementation(async (callback:any) =>
                callback({
                    findOne: jest.fn().mockImplementation(()=>Promise.resolve(null)),
                })
            );

            await expect(controller.update('1', {audioUrl: 'newUrl'})).rejects.toThrow(
                'TrackQuizAudio with id 1 not found'
            );
        });
    });

    describe('getNotPreparedTracks', () => {
        it('should return all not prepared tracks', async () => {
            const mockTracks = [{id: 1, prepared: false}];

            repository.find.mockResolvedValue(mockTracks as any);

            const result = await controller.getNotPreparedTracks();

            expect(repository.find).toHaveBeenCalledWith({
                where: {prepared: false},
                relations: ['quizAudioStartTimes'],
            });
            expect(result).toEqual(mockTracks);
        });
    });
});