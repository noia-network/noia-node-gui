import { NodeSettingsDto } from "@noia-network/node-settings";
import { DeepPartial } from "@noia-network/node-settings/dist/contracts/types-helpers";

export interface RequestNodeSettingsAction {
    type: "REQUEST_NODE_SETTINGS";
}

export interface UpdateNodeSettingsAction {
    type: "UPDATE_NODE_SETTINGS";
    settings: DeepPartial<NodeSettingsDto>;
    notify: boolean;
    restartNode: boolean;
}

export interface RequestNodeProcessRestartAction {
    type: "REQUEST_NODE_PROCESS_RESTART";
}
