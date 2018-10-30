import { NodeSettingsDto } from "@noia-network/node-settings";

import { MasterConnectionState } from "./node";
import { AppAction } from "./dispatcher";
import { NodeStoreState } from "../processes/node/node-store";

export interface NodeInitAction extends AppAction {
    type: "NODE_INIT";
}

export interface NodeReadyAction extends AppAction {
    type: "NODE_READY";
}

export interface SpeedStats {
    upload: number;
    download: number;
}

export interface UpdateSpeedAction extends AppAction {
    type: "UPDATE_SPEED";
    stats: SpeedStats;
}

export interface UpdateConnectionStatusAction extends AppAction {
    type: "NODE_UPDATE_STATUS";
    status: MasterConnectionState;
}

export interface NodeStoreDataAction {
    type: "NODE_STORE_DATA";
    state: NodeStoreState;
}

export interface NodeConnectionsCount {
    http: number;
    ws: number;
    wrtc: number;
}

export interface NodeConnectionsCountAction {
    type: "NODE_CONNECTIONS_COUNT";
    connections: NodeConnectionsCount;
}

export interface StorageStats {
    total: number;
    available: number;
    used: number;
}

export interface NodeStorageStatsAction {
    type: "NODE_STORAGE_STATS";
    stats: StorageStats;
}

export interface NodeTimeConnectedAction {
    type: "NODE_TIME_CONNECTED";
    connected: number;
}

export interface SeedStats {
    totalDownloaded: number;
    totalUploaded: number;
}

export interface NodeSeedStatsAction {
    type: "NODE_SEED_STATS";
    stats: SeedStats;
}

export interface NodeSettingsAction {
    type: "NODE_SETTINGS_ACTION";
    settings: NodeSettingsDto;
}

export interface NodeWarningAction {
    type: "NODE_WARNING";
    message: string;
}

export interface NodeCriticalErrorAction {
    type: "NODE_CRITICAL_ERROR";
    message: string;
}
