import { RequestNodeSettingsAction, UpdateNodeSettingsAction } from "@global/contracts/shared-actions";
import { RendererDispatcher } from "@renderer/dispatchers/dispatcher";

export namespace NodeSettingsActionsCreators {
    export function requestSettings(): void {
        RendererDispatcher.dispatch<RequestNodeSettingsAction>({
            type: "REQUEST_NODE_SETTINGS"
        });
    }

    export function updateSettings(settings: { [key: string]: unknown }, notify: boolean = false): void {
        RendererDispatcher.dispatch<UpdateNodeSettingsAction>({
            type: "UPDATE_NODE_SETTINGS",
            settings: settings,
            notify: notify
        });
    }
}
