import * as React from "react";

import { NodeConnection } from "@global/contracts/node-actions";
import { NodeSettingsActionsCreators, SettingsKeys } from "@renderer/modules/node-settings/node-settings-module";
import { NodeActionsCreators } from "../../../actions/node-actions-creators";

import "./controls-view.scss";

interface Props {
    connectionStatus: NodeConnection;
    autoReconnect: boolean;
}

export class ControlsView extends React.Component<Props> {
    private onAutoReconnectChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        const value = event.target.checked;

        NodeSettingsActionsCreators.updateSettings({
            [SettingsKeys.AutoReconnect]: value
        });
    };

    private onClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        switch (this.props.connectionStatus) {
            case NodeConnection.Init:
            case NodeConnection.Disonnected: {
                NodeActionsCreators.connect();
            }
            case NodeConnection.Connecting:
            case NodeConnection.Connected: {
                NodeActionsCreators.disconnect();
            }
        }
    };

    private renderButton(connection: NodeConnection): JSX.Element {
        switch (connection) {
            case NodeConnection.Init:
            case NodeConnection.Disonnected: {
                return (
                    <button className="button connect" onClick={this.onClick}>
                        <img src="static/icon-power.svg" />
                        <span>Connect</span>
                    </button>
                );
            }
            case NodeConnection.Connecting: {
                return (
                    <button className="button connect" onClick={this.onClick}>
                        <img src="static/icon-power.svg" />
                        <span>Connecting...</span>
                    </button>
                );
            }
            case NodeConnection.Connected: {
                return (
                    <button className="button connect green" onClick={this.onClick}>
                        <img src="static/icon-power.svg" />
                        <span>Connected</span>
                    </button>
                );
            }
        }
    }

    public render(): JSX.Element {
        return (
            <div className="controls-view">
                {this.renderButton(this.props.connectionStatus)}
                <div className="reconnect">
                    Auto reconnect <input type="checkbox" checked={this.props.autoReconnect} onChange={this.onAutoReconnectChange} />
                </div>
            </div>
        );
    }
}
