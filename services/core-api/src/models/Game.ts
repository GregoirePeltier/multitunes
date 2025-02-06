export interface Game{

}
export enum GameStatusValue{
    ACTIVE="active",
    ENDED="ended"
}
export interface GameStatus{
    status:GameStatusValue,
    players:number
}