import * as React from "react";
import { Container } from "flux/utils";

import { MasterConnectionState } from "@global/contracts/node";
import { NodeSettingsStore } from "@renderer/modules/node-settings/node-settings-module";

import { NodeStore } from "../../stores/node-store";
import { ControlsView } from "./controls/controls-view";

interface State {
    connectionStatus: MasterConnectionState | undefined;
    autoReconnect: boolean;
}

class ControlsContainerClass extends React.Component<{}, State> {
    public static getStores(): Container.StoresList {
        return [NodeStore, NodeSettingsStore];
    }

    public static calculateState(): State {
        const nodeSettings = NodeSettingsStore.getState().settings;
        let autoReconnect: boolean | undefined;
        if (nodeSettings != null) {
            autoReconnect = nodeSettings.autoReconnect;
        }

        return {
            connectionStatus: NodeStore.getState().connection,
            autoReconnect: autoReconnect || false
        };
    }

    public render(): JSX.Element | null {
        if (this.state.connectionStatus == null) {
            return null;
        }

        return <ControlsView connectionStatus={this.state.connectionStatus} autoReconnect={this.state.autoReconnect} />;
    }
}

export const ControlsContainer = Container.create(ControlsContainerClass);
