import * as React from "react";
import { Container } from "flux/utils";

import { NodeConnection } from "@global/contracts/node-actions";
import { NodeSettingsStore, SettingsKeys } from "@renderer/modules/node-settings/node-settings-module";

import { NodeStore } from "../../stores/node-store";
import { ControlsView } from "./controls/controls-view";

interface State {
    connectionStatus: NodeConnection;
    autoReconnect: boolean;
}

class ControlsContainerClass extends React.Component<{}, State> {
    public static getStores(): Container.StoresList {
        return [NodeStore, NodeSettingsStore];
    }

    public static calculateState(): State {
        let autoReconnect: boolean | undefined = NodeSettingsStore.get(SettingsKeys.AutoReconnect) as boolean | undefined;
        if (autoReconnect == null) {
            autoReconnect = false;
        }

        return {
            connectionStatus: NodeStore.getState().connection,
            autoReconnect: autoReconnect
        };
    }

    public render(): JSX.Element {
        return <ControlsView connectionStatus={this.state.connectionStatus} autoReconnect={this.state.autoReconnect} />;
    }
}

export const ControlsContainer = Container.create(ControlsContainerClass);
