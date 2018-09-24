import * as React from "react";
import { Container } from "flux/utils";

import { NodeStore } from "../../stores/node-store";
import { StatisticsView } from "./statistics/statistics-view";

function hhmmss(timeInSeconds: number): string {
    const seconds = Math.floor((timeInSeconds % 3600) % 60);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const hours = Math.floor(timeInSeconds / 3600);
    const secondsString = seconds < 10 ? `0${seconds}` : seconds;
    const minutesString = minutes < 10 ? `0${minutes}` : minutes;
    let hoursString: React.ReactText;
    if (hours < 10) {
        hoursString = `0${hours}`;
    } else if (hours >= 99999) {
        hoursString = ">99999";
    } else {
        hoursString = hours.toString();
    }

    return `${hoursString}:${minutesString}:${secondsString}`;
}

interface State {
    time: string;
}

class TimeConnectedContainerClass extends React.Component<{}, State> {
    public static getStores(): Container.StoresList {
        return [NodeStore];
    }

    public static calculateState(): State {
        const timeConnected = NodeStore.getState().timeConnected;

        return {
            time: hhmmss(timeConnected)
        };
    }

    public render(): JSX.Element {
        return <StatisticsView value={this.state.time} description="Time connected" />;
    }
}

export const TimeConnectedContainer = Container.create(TimeConnectedContainerClass);
