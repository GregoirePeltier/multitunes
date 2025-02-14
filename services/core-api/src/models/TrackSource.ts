import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Track } from "./Track";

export enum Source {
    DEEZER = "deezer",
}
export const SourceValues = Object.values(Source);

@Entity()
export class TrackSource {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    source: Source;

    @Column({nullable:true})
    url: string;

    @Column({ name: 'source_id',nullable:true })
    sourceId: string;

    @OneToOne(() => Track, track => track.trackSource,{onDelete: "CASCADE"})
    @JoinColumn()
    track: Track;
}