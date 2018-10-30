import { MasterConnectionState } from "../../../contracts/node";
import { NodeDispatcher } from "../node-dispatcher";
import {
    NodeInitAction,
    UpdateSpeedAction,
    SpeedStats,
    UpdateConnectionStatusAction,
    NodeStoreDataAction,
    NodeConnectionsCount,
    NodeConnectionsCountAction,
    NodeStorageStatsAction,
    StorageStats,
    NodeTimeConnectedAction,
    NodeSeedStatsAction,
    SeedStats,
    NodeSettingsAction,
    NodeReadyAction,
    NodeWarningAction
} from "../../../contracts/node-actions";
import { NodeStoreState, NodeStore } from "../node-store";
import { RequestNodeProcessRestartAction } from "contracts/shared-actions";
import { NodeSettingsDto } from "@noia-network/node-settings";

export namespace NodeActionsCreators {
    // TODO: Better name.
    export function init(): void {
        NodeDispatcher.dispatch<NodeInitAction>({
            type: "NODE_INIT"
        });
    }

    export function ready(): void {
        NodeDispatcher.dispatch<NodeReadyAction>({
            type: "NODE_READY"
        });
    }

    export function updateSpeed(speed: SpeedStats): void {
        const lastSpeed = NodeStore.getSpeed();
        if (lastSpeed.download === speed.download && lastSpeed.upload === speed.upload) {
            return;
        }

        NodeDispatcher.dispatch<UpdateSpeedAction>({
            type: "UPDATE_SPEED",
            stats: speed
        });
    }

    export function updateConnectionStatus(status: MasterConnectionState): void {
        NodeDispatcher.dispatch<UpdateConnectionStatusAction>({
            type: "NODE_UPDATE_STATUS",
            status: status
        });
    }

    export function sendNodeStoreData(storeState: NodeStoreState): void {
        NodeDispatcher.dispatch<NodeStoreDataAction>({
            type: "NODE_STORE_DATA",
            state: storeState
        });
    }

    export function updateConnectionsCount(count: Partial<NodeConnectionsCount>): void {
        const storeCount = NodeStore.getConnectionsCount();

        NodeDispatcher.dispatch<NodeConnectionsCountAction>({
            type: "NODE_CONNECTIONS_COUNT",
            connections: {
                ...storeCount,
                ...count
            }
        });
    }

    export function updateStorageStats(stats: StorageStats): void {
        NodeDispatcher.dispatch<NodeStorageStatsAction>({
            type: "NODE_STORAGE_STATS",
            stats: {
                ...stats,
                // TODO: Remove this when proper values are return from NoiaNode package.
                total: Number(stats.total)
            }
        });
    }

    export function updateTimeConnected(connected: number): void {
        const lastConnectedTime = NodeStore.getTimeConnected();
        if (lastConnectedTime === connected) {
            return;
        }

        NodeDispatcher.dispatch<NodeTimeConnectedAction>({
            type: "NODE_TIME_CONNECTED",
            connected: connected
        });
    }

    export function updateSeedStats(stats: SeedStats): void {
        const storeStats = NodeStore.getSeedStats();
        if (storeStats.totalDownloaded === stats.totalDownloaded && storeStats.totalUploaded === stats.totalUploaded) {
            return;
        }

        NodeDispatcher.dispatch<NodeSeedStatsAction>({
            type: "NODE_SEED_STATS",
            stats: stats
        });
    }

    export function updateSettings(settings: NodeSettingsDto): void {
        NodeDispatcher.dispatch<NodeSettingsAction>({
            type: "NODE_SETTINGS_ACTION",
            settings: settings
        });
    }

    export function restartNodeProcess(): void {
        NodeDispatcher.dispatch<RequestNodeProcessRestartAction>({
            type: "REQUEST_NODE_PROCESS_RESTART"
        });
    }

    export function warning(message: string): void {
        NodeDispatcher.dispatch<NodeWarningAction>({
            type: "NODE_WARNING",
            message: message
        });
    }
}
