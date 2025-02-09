import {Question} from "../model/Question.ts";

export function AnswerBoard(props: { question: Question, onAnswer: (id: number) => void }) {
    const {question,onAnswer} = props;
    return <div className={"answer-board"}>
        {question.answers.map((a)=><div className={"answer-button"} onClick={()=>onAnswer(a.id)}> {a.title}</div>)}
    </div>


}