import { MainDispatcher } from "./main-dispatcher";
import { UpdateAvailableAction, UpdateDownloadFailedAction, UpdateInstallFailedAction } from "../contracts/main-actions";

export namespace UpdateActionsCreators {
    export function updateAvailable(version: string, isMac?: boolean): void {
        MainDispatcher.dispatch<UpdateAvailableAction>({
            type: "UPDATE_AVAILABLE",
            version: version,
            isMac: isMac
        });
    }

    export function updateDownloadFailed(): void {
        MainDispatcher.dispatch<UpdateDownloadFailedAction>({
            type: "UPDATE_DOWNLOAD_FAILED"
        });
    }

    export function updateInstallFailed(): void {
        MainDispatcher.dispatch<UpdateInstallFailedAction>({
            type: "UPDATE_INSTALL_FAILED"
        });
    }
}
