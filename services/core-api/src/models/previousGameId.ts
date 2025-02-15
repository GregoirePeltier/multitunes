// src/entity/PreviousGame.view.ts
import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
    expression: `
        SELECT 
            g.id as game_id,
            (
                SELECT id 
                FROM game prev 
                WHERE prev.genre = g.genre 
                AND prev.date < g.date 
                ORDER BY prev.date DESC 
                LIMIT 1
            ) as previous_game_id
        FROM game g
    `
})
export class PreviousGameView {
    @ViewColumn()
    game_id: number;

    @ViewColumn()
    previous_game_id: number | null;
}