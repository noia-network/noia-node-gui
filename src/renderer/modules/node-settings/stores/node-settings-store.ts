import { ReduceStore, ActionHandler } from "simplr-flux";
import { NodeSettingsDto } from "@noia-network/node-settings";

import { NodeSettingsAction, NodeInitAction, NodeReadyAction } from "@global/contracts/node-actions";
import { NodeDispatcher } from "@global/processes/node/node-dispatcher";
import { NodeExitedAction } from "@global/contracts/main-actions";

import { NodeSettingsActionsCreators } from "../actions/node-settings-actions-creators";

interface State {
    settings: NodeSettingsDto | undefined;
    loaded: boolean;
}

class NodeSettingsStoreClass extends ReduceStore<State> {
    constructor() {
        super();
        this.registerFluxAction<NodeSettingsAction>("NODE_SETTINGS_ACTION", this.onSettingsUpdate);

        this.registerFluxAction<NodeInitAction>("NODE_INIT", this.onNodeRestart);
        this.registerFluxAction<NodeExitedAction>("NODE_EXITED", this.onNodeRestart);

        setTimeout(() => {
            NodeSettingsActionsCreators.requestSettings();
        });

        NodeDispatcher.addListener<NodeReadyAction>("NODE_READY", () => {
            NodeSettingsActionsCreators.requestSettings();
        });
    }

    public getInitialState(): State {
        return {
            loaded: false,
            settings: undefined
        };
    }

    private onNodeRestart = (): State => this.getInitialState();

    private onSettingsUpdate: ActionHandler<NodeSettingsAction, State> = (action, state) => ({
        ...state,
        loaded: true,
        settings: {
            ...state.settings,
            ...action.settings
        }
    });
}

export const NodeSettingsStore = new NodeSettingsStoreClass();
