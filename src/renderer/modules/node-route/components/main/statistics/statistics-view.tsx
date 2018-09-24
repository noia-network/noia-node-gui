import * as React from "react";

import "./statistics-view.scss";

interface Props {
    value: string | number;
    description: string;
}

export class StatisticsView extends React.Component<Props> {
    public render(): JSX.Element {
        return (
            <div className="statistics-view">
                <div className="value" title={this.props.value.toString()}>
                    {this.props.value}
                </div>
                <div className="description">{this.props.description}</div>
            </div>
        );
    }
}
