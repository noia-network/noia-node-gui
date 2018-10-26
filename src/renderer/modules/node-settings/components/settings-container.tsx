import * as React from "react";
import { Container } from "flux/utils";
import { NodeSettingsDto } from "@noia-network/node-settings";

import { LoaderView } from "@renderer/modules/shared/shared-module";

import { NodeSettingsStore } from "../stores/node-settings-store";

interface Props {
    children: (settings: NodeSettingsDto) => React.ReactNode;
}

interface State {
    settings: NodeSettingsDto | undefined;
    loaded: boolean;
}

class SettingsContainerClass extends React.Component<Props, State> {
    public state: State = {
        settings: undefined,
        loaded: false
    };

    public static getStores(): Container.StoresList {
        return [NodeSettingsStore];
    }

    public static calculateState(): State {
        const storeState = NodeSettingsStore.getState();
        return {
            settings: storeState.settings,
            loaded: storeState.loaded
        };
    }

    public render(): React.ReactNode {
        if (!this.state.loaded || this.state.settings == null) {
            return <LoaderView color="blue" containerFull={true} />;
        }

        return this.props.children(this.state.settings);
    }
}

export const SettingsContainer = Container.create(SettingsContainerClass);
