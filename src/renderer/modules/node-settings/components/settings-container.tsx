import * as React from "react";
import { Container } from "flux/utils";

import { NodeSettingsStore } from "../stores/node-settings-store";
import { LoaderView } from "@renderer/modules/shared/shared-module";

interface Props {
    children: (settings: { [key: string]: unknown }) => React.ReactNode;
}

interface State {
    settings: { [key: string]: unknown };
    loaded: boolean;
}

class SettingsContainerClass extends React.Component<Props, State> {
    public state: State = {
        settings: {},
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
        if (!this.state.loaded) {
            return <LoaderView color="blue" containerFull={true} />;
        }

        return this.props.children(this.state.settings);
    }
}

export const SettingsContainer = Container.create(SettingsContainerClass);
