import { ConnectAction, DisconnectAction, RequestNodeDataAction, RequestStorageStatsAction } from "@global/contracts/renderer-actions";
import { RendererDispatcher } from "@renderer/dispatchers/dispatcher";
import { RequestNodeProcessRestartAction } from "@global/contracts/shared-actions";

export namespace NodeActionsCreators {
    export function connect(): void {
        RendererDispatcher.dispatch<ConnectAction>({
            type: "NODE_CONNECT"
        });
    }

    export function disconnect(): void {
        RendererDispatcher.dispatch<DisconnectAction>({
            type: "NODE_DISCONNECT"
        });
    }

    export function requestNodeData(): void {
        RendererDispatcher.dispatch<RequestNodeDataAction>({
            type: "NODE_REQUEST_DATA"
        });
    }

    export function requestStorageStats(): void {
        RendererDispatcher.dispatch<RequestStorageStatsAction>({
            type: "NODE_REQUEST_STORAGE_STATS"
        });
    }

    export function restartServer(): void {
        RendererDispatcher.dispatch<RequestNodeProcessRestartAction>({
            type: "REQUEST_NODE_PROCESS_RESTART"
        });
    }
}
