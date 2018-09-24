import { AppAction } from "./dispatcher";

export interface ConnectAction extends AppAction {
    type: "NODE_CONNECT";
}

export interface DisconnectAction extends AppAction {
    type: "NODE_DISCONNECT";
}

export interface RequestNodeDataAction extends AppAction {
    type: "NODE_REQUEST_DATA";
}

export interface RequestStorageStatsAction {
    type: "NODE_REQUEST_STORAGE_STATS";
}
