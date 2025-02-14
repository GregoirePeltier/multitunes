import {Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, ManyToOne, PrimaryColumn} from "typeorm";
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
    @OneToMany(() => Question, question => question.track)
    questions: Question[];
    @OneToOne(() => TrackSource, trackSource => trackSource.track,{onDelete: "CASCADE"})
    trackSource: TrackSource;
}