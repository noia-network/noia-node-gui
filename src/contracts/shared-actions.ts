export interface RequestNodeSettingsAction {
    type: "REQUEST_NODE_SETTINGS";
}

export interface UpdateNodeSettingsAction {
    type: "UPDATE_NODE_SETTINGS";
    settings: { [key: string]: unknown };
    notify: boolean;
}

export interface RequestNodeProcessRestartAction {
    type: "REQUEST_NODE_PROCESS_RESTART";
}
