import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn
} from "typeorm";
import {TrackSource} from "./TrackSource";
import {Question} from "./Game";

@Entity()
export class Track {
    @PrimaryGeneratedColumn({"type": "bigint"})
    id: number;

    @Column()
    title: string;

    @Column()
    artist: string;

    @Column({nullable: true})
    preview: string;
    @Column({nullable: true})
    cover: string;
    @OneToMany(() => Question, question => question.track,)
    questions: Question[];
    @OneToOne(() => TrackSource, trackSource => trackSource.track,{onDelete: "CASCADE"})
    trackSource: TrackSource;
}

export enum StemType {
    DRUMS = "drums",
    VOCALS = "vocals",
    GUITAR = "guitar",
    BASS = "bass",
    PIANO = "piano",
    OTHER = "other",
}

@Entity()
export class TrackQuizAudio {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({name: "trackId"})
    trackId: number;
    @ManyToOne(() => Track, track => track.id,{onDelete:"CASCADE"})
    @JoinColumn({name: "trackId"})
    track: Track;
    @Column({default: false})
    prepared:boolean;
    @Column()
    audioUrl: string;
    @Column()
    audioTreatmentVersion: number; // This is an arbitrary number to know what track we should treat again
    @Column()
    questionId: number;
    @OneToOne(() => Question, question => question.id,{onDelete: "CASCADE"})
    @JoinColumn()
    question:Question
    @OneToMany(() => QuizAudioStartTimes, quizAudioStartTime => quizAudioStartTime.trackQuizAudio)
    quizAudioStartTimes: QuizAudioStartTimes[];
}

@Entity()
export class QuizAudioStartTimes {
    @PrimaryColumn()
    trackQuizAudioId: number;

    @PrimaryColumn()
    stem: StemType;
    @Column()
    startTime: number;
    @ManyToOne(() => TrackQuizAudio, trackQuizAudio => trackQuizAudio.id)
    trackQuizAudio: TrackQuizAudio;
}