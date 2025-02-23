import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

import {GameGenre} from "./GameGenre";

@Entity()
export class TrackGenre {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "int",
    })
    genre: GameGenre;
}