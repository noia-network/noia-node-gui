import { MainDispatcher } from "./main-dispatcher";
import { RequestNodeSettingsAction } from "../contracts/shared-actions";
import { NodeExitedAction } from "contracts/main-actions";

export namespace NodeActionsCreators {
    export function requestNodeSettings(): void {
        MainDispatcher.dispatch<RequestNodeSettingsAction>({
            type: "REQUEST_NODE_SETTINGS"
        });
    }

    export function nodeExited(): void {
        MainDispatcher.dispatch<NodeExitedAction>({
            type: "NODE_EXITED"
        });
    }
}
