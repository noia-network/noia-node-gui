import { NodeSettingsDto } from "@noia-network/node-settings";
import { DeepPartial } from "@noia-network/node-settings/dist/contracts/types-helpers";

import { RequestNodeSettingsAction, UpdateNodeSettingsAction } from "@global/contracts/shared-actions";
import { RendererDispatcher } from "@renderer/dispatchers/dispatcher";

export namespace NodeSettingsActionsCreators {
    export function requestSettings(): void {
        RendererDispatcher.dispatch<RequestNodeSettingsAction>({
            type: "REQUEST_NODE_SETTINGS"
        });
    }

    export interface UpdateSettingsOptions {
        settings: DeepPartial<NodeSettingsDto>;
        notify: boolean;
        restartNode: boolean;
    }

    export function updateSettings(options: UpdateSettingsOptions): void {
        RendererDispatcher.dispatch<UpdateNodeSettingsAction>({
            type: "UPDATE_NODE_SETTINGS",
            ...options
        });
    }
}
