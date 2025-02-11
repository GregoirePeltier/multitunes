import {LoadingState} from "./LoadingState.tsx";
import {Link} from "react-router-dom";

function ProgressBar(props: { value: number, total: number }) {
    const width = (props.value / props.total) * 100
    return <div className={"progress-bar-container"} style={{border: "solid 1px white", borderRadius: "0.2em"}}>
        <div className={"progress-bar"} style={{width: `${width}%`}}></div>
    </div>
}

export function LoadingScreen(props: { loadingState: LoadingState | null }) {
    const {loadingState} = props;
    if (!loadingState) {
        return <div className={"card primary-bg"}>
            <div>A problem occured while loading</div>
            <Link to={"/"} className={"button"}> Try Again</Link>
        </div>
    }
    return <div className={"card primary-bg m-auto"}>
        <h1 className={"card-title"}>
            Loading Your Game
        </h1>
        {loadingState.gameLoaded && loadingState.stemLoading.map((loading, index) => {
            let loadingValue = loading?mean(loading.map((l) => l.progress)):0;
            return <div key={index} style={{display:"flex",minWidth:"100%",alignItems:"center",justifyContent:"center"}}>
                <div style={{textWrap:"nowrap",margin:"0.5em"}}>Track {index+1}</div>
                {<ProgressBar value={loadingValue} total={100}/>}

            </div>
        })}
    </div>
}

function mean(values: Array<number>): number {
    return values.reduce((a, b) => a + b) / values.length
}