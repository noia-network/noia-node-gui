export interface NodeExitedAction {
    type: "NODE_EXITED";
}

export interface UpdateAvailableAction {
    type: "UPDATE_AVAILABLE";
    version: string;
    // TODO: Remove this later.
    isMac?: boolean;
}

export interface UpdateDownloadFailedAction {
    type: "UPDATE_DOWNLOAD_FAILED";
}

export interface UpdateInstallFailedAction {
    type: "UPDATE_INSTALL_FAILED";
}

export interface DownloadUpdateAction {
    type: "DOWNLOAD_UPDATE";
}

export interface SaveUpdateAction {
    type: "SAVE_UPDATE";
}
