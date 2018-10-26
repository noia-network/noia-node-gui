import { MasterConnectionState } from "../../contracts/node";
import { Store, StoreActionHandler } from "../../abstractions/store";
import { NodeDispatcher } from "./node-dispatcher";

import {
    UpdateConnectionStatusAction,
    SpeedStats,
    UpdateSpeedAction,
    NodeConnectionsCount,
    NodeConnectionsCountAction,
    NodeStorageStatsAction,
    StorageStats,
    NodeTimeConnectedAction,
    NodeSeedStatsAction,
    SeedStats
} from "../../contracts/node-actions";
import { RequestNodeDataAction } from "../../contracts/renderer-actions";
import { NodeActionsCreators } from "./actions/node-actions-creators";

export interface NodeStoreState {
    connection: MasterConnectionState | undefined;
    connectionsCount: NodeConnectionsCount;
    speed: SpeedStats;
    storageStats: StorageStats;
    /**
     * Seconds.
     */
    timeConnected: number;
    seedStats: SeedStats;
}

class NodeStoreClass extends Store<NodeStoreState> {
    constructor() {
        super(NodeDispatcher);

        this.registerAction<UpdateConnectionStatusAction>("NODE_UPDATE_STATUS", this.onConnectionStatusUpdate);
        this.registerAction<UpdateSpeedAction>("UPDATE_SPEED", this.onUpdateSpeed);
        this.registerAction<NodeConnectionsCountAction>("NODE_CONNECTIONS_COUNT", this.onConnectionsCount);
        this.registerAction<NodeStorageStatsAction>("NODE_STORAGE_STATS", this.onStorageStats);
        this.registerAction<NodeTimeConnectedAction>("NODE_TIME_CONNECTED", this.onTimeConnected);
        this.registerAction<NodeSeedStatsAction>("NODE_SEED_STATS", this.onSeedStats);

        this.dispatcher.addListener<RequestNodeDataAction>("NODE_REQUEST_DATA", this.onRequestData);
    }

    public getInitialState(): NodeStoreState {
        return {
            connection: undefined,
            speed: {
                download: 0,
                upload: 0
            },
            connectionsCount: {
                http: 0,
                wrtc: 0,
                ws: 0
            },
            storageStats: {
                available: 0,
                total: 0,
                used: 0
            },
            timeConnected: 0,
            seedStats: {
                totalDownloaded: 0,
                totalUploaded: 0
            }
        };
    }

    public getSpeed(): SpeedStats {
        return this.getState().speed;
    }

    public getConnectionStatus(): MasterConnectionState | undefined {
        return this.getState().connection;
    }

    public getConnectionsCount(): NodeConnectionsCount {
        return this.getState().connectionsCount;
    }

    public getTimeConnected(): number {
        return this.getState().timeConnected;
    }

    public getSeedStats(): SeedStats {
        return this.getState().seedStats;
    }

    private onRequestData = (_action: RequestNodeDataAction) => {
        NodeActionsCreators.sendNodeStoreData(this.getState());
    };

    //#region Actions
    private onConnectionStatusUpdate: StoreActionHandler<UpdateConnectionStatusAction, NodeStoreState> = (action, state) => ({
        ...state,
        connection: action.status
    });

    private onUpdateSpeed: StoreActionHandler<UpdateSpeedAction, NodeStoreState> = (action, state) => ({
        ...state,
        speed: action.stats
    });

    private onConnectionsCount: StoreActionHandler<NodeConnectionsCountAction, NodeStoreState> = (action, state) => ({
        ...state,
        connectionsCount: action.connections
    });

    private onStorageStats: StoreActionHandler<NodeStorageStatsAction, NodeStoreState> = (action, state) => ({
        ...state,
        storageStats: action.stats
    });

    private onTimeConnected: StoreActionHandler<NodeTimeConnectedAction, NodeStoreState> = (action, state) => ({
        ...state,
        timeConnected: action.connected
    });
    private onSeedStats: StoreActionHandler<NodeSeedStatsAction, NodeStoreState> = (action, state) => ({
        ...state,
        seedStats: action.stats
    });
    //#endregion
}

export const NodeStore = new NodeStoreClass();
