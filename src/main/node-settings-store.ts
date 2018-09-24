import { GuiSettingsKeys } from "@global/contracts/node-settings";

import { Store, StoreActionHandler } from "../abstractions/store";
import { MainDispatcher } from "./main-dispatcher";

import { NodeSettingsAction, NodeInitAction } from "../contracts/node-actions";
import { NodeExitedAction } from "../contracts/main-actions";
import { NodeActionsCreators } from "./node-actions-creators";

interface State {
    settings: { [key: string]: unknown };
}

class NodeSettingsStoreClass extends Store<State> {
    constructor() {
        super(MainDispatcher);

        this.registerAction<NodeSettingsAction>("NODE_SETTINGS_ACTION", this.onSettingsUpdate);

        this.registerAction<NodeInitAction>("NODE_INIT", this.onNodeInit);
        this.registerAction<NodeExitedAction>("NODE_EXITED", this.onNodeInit);

        setTimeout(() => {
            NodeActionsCreators.requestNodeSettings();
        });
    }

    public getInitialState(): State {
        return {
            settings: {}
        };
    }

    public get minimizeToTray(): boolean {
        const minimizeToTray = this.getState().settings[GuiSettingsKeys.MinimizeToTray];
        if (minimizeToTray != null && typeof minimizeToTray === "boolean") {
            return minimizeToTray;
        }

        return false;
    }

    private onNodeInit = (): State => this.getInitialState();

    private onSettingsUpdate: StoreActionHandler<NodeSettingsAction, State> = (action, state) => ({
        ...state,
        settings: {
            ...state.settings,
            ...action.settings
        }
    });
}

export const NodeSettingsStore = new NodeSettingsStoreClass();
