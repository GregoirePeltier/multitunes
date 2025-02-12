import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    PrimaryGeneratedColumn
} from "typeorm";
import {Track} from "./Track";

export enum GameGenre {
    ALL=0,
    POP = 132,
    ROCK = 152,
    METAL = 464,
    RAP = 116,
    RNB = 165,
    FOLK = 466,
    COUNTRY = 84,
    FRENCH = 52,
    SOUL = 169,
    BLUES = 153
}

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @CreateDateColumn()
    date: Date;

    @Column({
        type: "enum",
        enum: GameGenre
    })
    genre: GameGenre;

    @OneToMany(() => Question, question => question.game, {
        eager: true,
        cascade: true
    })
    questions: Question[];
}

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Game, game => game.questions)
    game: Game;

    @OneToMany(() => Answer, answer => answer.question, {
        eager: true,
        cascade: true
    })
    answers: Answer[];

    @ManyToOne(() => Track, track => track.questions, {
        eager: true
    })
    track: Track;
}

@Entity()
export class Answer {

    @PrimaryColumn({type: "bigint"})
    id: number;
    @PrimaryColumn()
    questionId: number;

    @Column()
    title: string;

    @ManyToOne(() => Question, question => question.answers)
    question: Question;
}


// Repository methods for efficient querying
export const getGameByDate = (repository: any, date: Date) => {
    return repository.findOne({
        where: { date },
        relations: ["questions", "questions.answers", "questions.track"]
    });
};

export const createGame = async (repository: any, game: Partial<Game>) => {
    const newGame = repository.create(game);
    return repository.save(newGame);
};