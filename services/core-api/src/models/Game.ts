export interface Game{

}
export enum GameStatusValue{
    ACTIVE="active",
    ENDED="ended",
    INITIALIZING="initializing",
}
export interface GameStatus{
    status:GameStatusValue,
    players:number
}