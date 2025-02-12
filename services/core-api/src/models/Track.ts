import {Column, Entity, Index, OneToMany, OneToOne, PrimaryColumn} from "typeorm";
import {Question} from "./Game";
import {TrackSource} from "./TrackSource";

@Entity()
@Index(["title", "artist"])
export class Track {
    @PrimaryColumn({type: "bigint"})
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
    @OneToOne(() => TrackSource, trackSource => trackSource.track,{nullable: true})
    trackSource?: TrackSource;

}