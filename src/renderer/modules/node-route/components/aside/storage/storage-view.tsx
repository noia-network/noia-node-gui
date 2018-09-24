import * as React from "react";
import * as bytes from "bytes";

import { Helpers } from "@global/helpers";

import { ProgressBarView } from "@renderer/modules/shared/shared-module";
import { NodeActionsCreators } from "../../../actions/node-actions-creators";

import "./storage-view.scss";

interface Props {
    usedStorage: number;
    availableStorage: number;
}

interface State {
    used: Helpers.ParsedStorageResult;
    available: Helpers.ParsedStorageResult;
    progress: number;
}

export class StorageView extends React.Component<Props, State> {
    public state: State = {
        used: {
            unit: "B",
            value: 0
        },
        available: {
            unit: "B",
            value: 0
        },
        progress: 0
    };

    public static getDerivedStateFromProps(props: Props): State {
        const usedString = bytes(props.usedStorage);
        const availableString = bytes(props.availableStorage);

        return {
            used: Helpers.parseStorageText(usedString),
            available: Helpers.parseStorageText(availableString),
            progress: (props.usedStorage * 100) / props.availableStorage
        };
    }

    public componentDidMount(): void {
        NodeActionsCreators.requestStorageStats();
    }

    public render(): JSX.Element {
        return (
            <div className="storage-view">
                <div className="wrapper">
                    <div className="title">Available storage</div>
                    <div className="storage-size">
                        <span className="value">{this.state.used.value}</span>
                        {this.state.used.unit}
                        <span className="separator">/</span>
                        <span className="value">{this.state.available.value}</span>
                        {this.state.available.unit}
                    </div>
                    <ProgressBarView progress={this.state.progress} />
                </div>
            </div>
        );
    }
}
