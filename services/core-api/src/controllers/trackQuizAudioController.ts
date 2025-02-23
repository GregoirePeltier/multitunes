// src/controllers/TrackQuizAudioController.ts



import {QuizAudioStartTimes, StemType, TrackQuizAudio} from "../models/Track";
import {Repository} from "typeorm";

interface TrackQuizAudioData {
  audioUrl: string;
  questionId: number ;
  trackId: number;
  stemsStarts?: Array<[StemType, number]>
  audioTreatmentVersion?: number;
  prepared?: boolean;
}


export class TrackQuizAudioController {
  constructor(private repository: Repository<TrackQuizAudio>,
              private startTimeRepository:Repository<QuizAudioStartTimes>) {} // Replace 'any' with your actual repository type

  async create(data: TrackQuizAudioData): Promise<TrackQuizAudio> {
    const audio = this.repository.create({
      audioUrl: data.audioUrl,
      prepared: data.prepared,
      audioTreatmentVersion: data.audioTreatmentVersion,
      questionId: data.questionId,
      trackId: data.trackId,
    });
    const insertResult = await this.repository.insert(audio);
    const id=insertResult.generatedMaps[0].id;
    if (data.stemsStarts){
      const startTimes = data.stemsStarts.map(([stem,time])=>this.startTimeRepository.create(
          {
            trackQuizAudioId:id,
            stem,
            startTime:time,
          }
      ))
      await Promise.all(startTimes.map(async startTime=>await this.startTimeRepository.insert(startTime)))
    }
    return await this.get(id)
  }
  async get(id: number): Promise<TrackQuizAudio> {

    const trackQuizAudio = await this.repository.findOne({
      where: {id},
      relations: ['quizAudioStartTimes'] // Include related entities if needed
    });
    if (!trackQuizAudio) {
      throw new Error(`TrackQuizAudio with id ${id} not found`);
    }
    return trackQuizAudio;
  }
  async getAll(): Promise<TrackQuizAudio[]> {
    return this.repository.find();
  }

  async update(id: string, data: Partial<TrackQuizAudioData>): Promise<TrackQuizAudio> {

    return await this.repository.manager.transaction(async (transactionalEntityManager) => {
      const trackQuizAudio = await transactionalEntityManager.findOne(this.repository.target, {where: {id: Number(id)}});
      if (!trackQuizAudio) {
        throw new Error(`TrackQuizAudio with id ${id} not found`);
      }

      // Check if stemsStarts is provided and update those as well
      if (data.stemsStarts) {
        // Delete existing startTimes for the given trackQuizAudioId
        await transactionalEntityManager.delete(this.startTimeRepository.target, {trackQuizAudioId: Number(id)});

        // Add the new startTimes
        const startTimes = data.stemsStarts.map(([stem, time]) =>
            transactionalEntityManager.create(this.startTimeRepository.target, {
              trackQuizAudioId: Number(id),
              stem,
              startTime: time,
            })
        );
        await Promise.all(
            startTimes.map(async (startTime) => await transactionalEntityManager.insert(this.startTimeRepository.target, startTime))
        );
      }
        const update  = {
      audioUrl: data.audioUrl,
      prepared: data.prepared,
      audioTreatmentVersion: data.audioTreatmentVersion,
      questionId: data.questionId,
      trackId: data.trackId,
    };

      // Update the main TrackQuizAudio entity
      await transactionalEntityManager.update(this.repository.target, {id: Number(id)}, update);

      let result = await transactionalEntityManager.findOne(this.repository.target, {
        where: {id: Number(id)},
        relations: ['quizAudioStartTimes']
      });
      if(!result){
        throw `Error while updating audio, could not return a result`
      }
      return result;
    });
  }

  async getNotPreparedTracks() {

    const notPreparedTracks = await this.repository.find({
      where: {prepared: false},
      relations: ['quizAudioStartTimes']
    });
    return notPreparedTracks;
  }

  async getById(id: number) {

    const trackQuizAudio = await this.repository.findOne({
      where: {id},
      relations: ['quizAudioStartTimes'], // Ensures quizAudioStartTimes are included
    });

    if (!trackQuizAudio) {
      throw new Error(`TrackQuizAudio with id ${id} not found`);
    }

    return trackQuizAudio;
  }
}