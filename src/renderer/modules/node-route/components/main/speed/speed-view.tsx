import * as React from "react";

import { GaugeView } from "../gauge/gauge-view";

import "./speed-view.scss";

type Units = "bps" | "kbps" | "mbps";

interface Props {
    speedBps: number;
    description: string;
}

interface State {
    degree: number;
    units: Units;
    maxSpeedBps: number;
    speedTransformed: string;
}

export class SpeedView extends React.Component<Props, State> {
    public state: State = {
        degree: 0,
        units: "bps",
        speedTransformed: "0",
        maxSpeedBps: 0
    };

    public static getDerivedStateFromProps(nextProps: Props, prevState: State): State {
        const precision = 0;
        const kbps = 1000;
        const mbps = 1000 * kbps;

        let units: Units = "bps";
        let speedTransformed: string = "0";
        let maxSpeed: number = prevState.maxSpeedBps;

        if (nextProps.speedBps <= kbps) {
            units = "bps";
            speedTransformed = nextProps.speedBps.toFixed(precision);
        } else if (nextProps.speedBps <= mbps) {
            units = "kbps";
            speedTransformed = Math.round(nextProps.speedBps / kbps).toFixed(precision);
        } else {
            units = "mbps";
            speedTransformed = Math.round(nextProps.speedBps / mbps).toFixed(precision);
        }

        if (maxSpeed < nextProps.speedBps) {
            maxSpeed = nextProps.speedBps;
        }

        return {
            degree: Math.round(240 * (nextProps.speedBps / maxSpeed)),
            maxSpeedBps: maxSpeed,
            speedTransformed: speedTransformed,
            units: units
        };
    }

    public render(): JSX.Element {
        return (
            <div className="speed-view">
                <GaugeView degree={this.state.degree} />
                <div className="title">
                    {this.state.speedTransformed} <span className="unit">{this.state.units}</span>
                </div>
                <div className="description">{this.props.description}</div>
            </div>
        );
    }
}
