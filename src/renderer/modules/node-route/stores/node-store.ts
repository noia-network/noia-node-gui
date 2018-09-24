import { ReduceStore } from "simplr-flux";

import {
    NodeConnection,
    UpdateConnectionStatusAction,
    NodeStoreDataAction,
    SpeedStats,
    UpdateSpeedAction,
    NodeConnectionsCount,
    NodeStorageStatsAction,
    StorageStats,
    NodeTimeConnectedAction,
    NodeSeedStatsAction,
    SeedStats,
    NodeInitAction,
    NodeConnectionsCountAction
} from "@global/contracts/node-actions";
import { NodeActionsCreators } from "../actions/node-actions-creators";
import { NodeExitedAction } from "contracts/main-actions";

interface State {
    connection: NodeConnection;
    connectionsCount: NodeConnectionsCount;
    speed: SpeedStats;
    storageStats: StorageStats;
    timeConnected: number;
    seedStats: SeedStats;
}

class NodeStoreClass extends ReduceStore<State> {
    constructor() {
        super();

        this.registerFluxAction<UpdateConnectionStatusAction>("NODE_UPDATE_STATUS", this.onConnectionUpdate);
        this.registerFluxAction<UpdateSpeedAction>("UPDATE_SPEED", this.onSpeedUpdate);
        this.registerFluxAction<NodeStorageStatsAction>("NODE_STORAGE_STATS", this.onStorageStats);
        this.registerFluxAction<NodeTimeConnectedAction>("NODE_TIME_CONNECTED", this.onTimeConnected);
        this.registerFluxAction<NodeSeedStatsAction>("NODE_SEED_STATS", this.onSeedStats);
        this.registerFluxAction<NodeConnectionsCountAction>("NODE_CONNECTIONS_COUNT", this.onConnectionsCount);

        this.registerFluxAction<NodeStoreDataAction>("NODE_STORE_DATA", this.onStoreData);
        this.registerFluxAction<NodeInitAction>("NODE_INIT", this.onNodeRestart);
        this.registerFluxAction<NodeExitedAction>("NODE_EXITED", this.onNodeRestart);

        // Always when initializing to received latest data.
        setTimeout(() => {
            NodeActionsCreators.requestNodeData();
        });
    }

    public getInitialState(): State {
        return {
            connection: NodeConnection.Init,
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

    private onStoreData = (action: NodeStoreDataAction, state: State): State => ({
        ...state,
        ...action.state
    });

    private onNodeRestart = (): State => this.getInitialState();

    private onConnectionUpdate = (action: UpdateConnectionStatusAction, state: State): State => ({
        ...state,
        connection: action.status
    });

    private onConnectionsCount = (action: NodeConnectionsCountAction, state: State): State => ({
        ...state,
        connectionsCount: action.connections
    });

    private onSpeedUpdate = (action: UpdateSpeedAction, state: State): State => ({
        ...state,
        speed: action.stats
    });

    private onStorageStats = (action: NodeStorageStatsAction, state: State): State => ({
        ...state,
        storageStats: action.stats
    });

    private onTimeConnected = (action: NodeTimeConnectedAction, state: State): State => ({
        ...state,
        timeConnected: action.connected
    });

    private onSeedStats = (action: NodeSeedStatsAction, state: State): State => ({
        ...state,
        seedStats: action.stats
    });
}

export const NodeStore = new NodeStoreClass();
