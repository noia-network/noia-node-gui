import * as React from "react";
import * as bytes from "bytes";

import { Helpers } from "@global/helpers";

import "./data-view.scss";

interface Props {
    /**
     * bytes.
     */
    value: number;
    description: string;
}

interface State {
    size: Helpers.ParsedStorageResult;
}

export class DataView extends React.Component<Props, State> {
    public state: State = {
        size: {
            unit: "B",
            value: 0
        }
    };

    public static getDerivedStateFromProps(props: Props): State {
        const sizeString = bytes(props.value);

        return {
            size: Helpers.parseStorageText(sizeString)
        };
    }

    public render(): JSX.Element {
        return (
            <div className="data-view">
                <div className="wrapper">
                    <div className="title">
                        <span className="value">{this.state.size.value}</span>
                        <span className="unit">{this.state.size.unit}</span>
                    </div>
                    <div className="description">{this.props.description}</div>
                </div>
            </div>
        );
    }
}
