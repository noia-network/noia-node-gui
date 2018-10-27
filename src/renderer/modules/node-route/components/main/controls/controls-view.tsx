import * as React from "react";

import { MasterConnectionState } from "@global/contracts/node";
import { NodeSettingsActionsCreators } from "@renderer/modules/node-settings/node-settings-module";
import { NodeActionsCreators } from "../../../actions/node-actions-creators";

import "./controls-view.scss";

interface Props {
    connectionStatus: MasterConnectionState;
    autoReconnect: boolean;
}

export class ControlsView extends React.Component<Props> {
    private onAutoReconnectChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        const value = event.target.checked;

        NodeSettingsActionsCreators.updateSettings({
            settings: {
                autoReconnect: value
            },
            notify: false,
            restartNode: false
        });
    };

    private onClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        switch (this.props.connectionStatus) {
            case MasterConnectionState.Disconnected: {
                NodeActionsCreators.connect();
            }
            case MasterConnectionState.Connecting:
            case MasterConnectionState.Connected: {
                NodeActionsCreators.disconnect();
            }
        }
    };

    private renderButton(connection: MasterConnectionState): JSX.Element {
        switch (connection) {
            case MasterConnectionState.Disconnected: {
                return (
                    <button className="button connect" onClick={this.onClick}>
                        <img src="static/icon-power.svg" />
                        <span>Connect</span>
                    </button>
                );
            }
            case MasterConnectionState.Connecting: {
                return (
                    <button className="button connect" onClick={this.onClick}>
                        <img src="static/icon-power.svg" />
                        <span>Connecting...</span>
                    </button>
                );
            }
            case MasterConnectionState.Connected: {
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
