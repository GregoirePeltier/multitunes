import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Track} from "./Track";

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
    @Column()
    url: string;
    @OneToOne(() => Track, track => track.id)
    @JoinColumn()
    track: Track;
}