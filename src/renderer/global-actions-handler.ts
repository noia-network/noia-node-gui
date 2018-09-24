import { remote } from "electron";

import { NodeCriticalErrorAction } from "@global/contracts/node-actions";
import { RendererDispatcher } from "@renderer/dispatchers/dispatcher";
import { NodeActionsCreators } from "@renderer/modules/node-route/node-route-module";
import { NotificationsActionsCreators } from "@renderer/modules/notifications/notifications-module";
import {
    UpdateAvailableAction,
    DownloadUpdateAction,
    UpdateDownloadFailedAction,
    UpdateInstallFailedAction,
    SaveUpdateAction
} from "@global/contracts/main-actions";

const GITHUB_RELEASES_URL = "https://github.com/noia-network/noia-node-gui/releases";

RendererDispatcher.addListener<NodeCriticalErrorAction>("NODE_CRITICAL_ERROR", action => {
    NotificationsActionsCreators.addNotification({
        level: "error",
        title: "Critical Node Error",
        message: action.message,
        autoDismiss: 0,
        action: {
            label: "Restart Node",
            callback: () => {
                NodeActionsCreators.restartServer();
            }
        }
    });
});

RendererDispatcher.addListener<UpdateAvailableAction>("UPDATE_AVAILABLE", action => {
    if (action.isMac) {
        NotificationsActionsCreators.addNotification({
            level: "info",
            uid: "electron-updater",
            title: "Update",
            message: `Update is available v${action.version}.`,
            autoDismiss: 0,
            action: {
                label: "Github Releases",
                callback: () => {
                    remote.shell.openExternal(GITHUB_RELEASES_URL);
                }
            }
        });
    } else {
        NotificationsActionsCreators.addNotification({
            level: "info",
            uid: "electron-updater",
            title: "Update",
            message: `Update is available v${action.version}.`,
            autoDismiss: 0,
            action: {
                label: "Download & Update",
                callback: () => {
                    RendererDispatcher.dispatch<DownloadUpdateAction>({
                        type: "DOWNLOAD_UPDATE"
                    });
                }
            }
        });
    }
});

RendererDispatcher.addListener<UpdateDownloadFailedAction>("UPDATE_DOWNLOAD_FAILED", action => {
    NotificationsActionsCreators.addNotification({
        level: "error",
        message: `Failed to download.`,
        autoDismiss: 0,
        action: {
            label: "Github Releases",
            callback: () => {
                remote.shell.openExternal(GITHUB_RELEASES_URL);
            }
        }
    });
});

RendererDispatcher.addListener<UpdateInstallFailedAction>("UPDATE_INSTALL_FAILED", () => {
    NotificationsActionsCreators.addNotification({
        level: "error",
        message: `Failed to install.`,
        autoDismiss: 0,
        action: {
            label: "Save Setup",
            callback: () => {
                RendererDispatcher.dispatch<SaveUpdateAction>({
                    type: "SAVE_UPDATE"
                });
            }
        }
    });
});
