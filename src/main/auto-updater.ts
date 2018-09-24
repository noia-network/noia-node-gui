import { dialog, BrowserWindow } from "electron";
import { autoUpdater, UpdateInfo } from "electron-updater";
import * as path from "path";
import * as fs from "fs-extra";
import * as isDev from "electron-is-dev";

import { NotificationActionsCreators } from "./notifications-actions-creators";
import { UpdateActionsCreators } from "./update-actions-creators";

enum UpdateStatus {
    Init = 0,
    Available = 8,
    Downloaded = 16
}

export class AutoUpdater {
    constructor(private readonly browserWindow: BrowserWindow, private readonly checkIntervalTime: number = 10 * 60 * 1000) {
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = false;

        autoUpdater.on("error", this.onError);
        autoUpdater.on("update-available", this.onUpdateAvailable);
        autoUpdater.on("update-downloaded", this.onUpdateDownloaded);

        if (isDev) {
            autoUpdater.updateConfigPath = path.join(__dirname, "../../dev-app-update.yml");
        }
    }

    private updateCheckInterval: NodeJS.Timer | undefined;
    private updateStatus: UpdateStatus = UpdateStatus.Init;
    private updateInfo: UpdateInfo | undefined;

    public start(): void {
        this.checkForUpdates();
        this.updateCheckInterval = global.setInterval(this.checkForUpdates, this.checkIntervalTime);
    }

    public stop(): void {
        if (this.updateCheckInterval != null) {
            global.clearInterval(this.updateCheckInterval);
        }
    }

    public async download(): Promise<void> {
        NotificationActionsCreators.createNotification({
            level: "info",
            title: "Update",
            message: "Update is downloading."
        });
        await autoUpdater.downloadUpdate();
    }

    public retryInstall(): void {
        autoUpdater.quitAndInstall();
    }

    public async saveUpdate(): Promise<void> {
        if (this.updateInfo == null) {
            return;
        }

        // @ts-ignore // TODO: Fix this hack.
        const cacheDir: string = autoUpdater.downloadedUpdateHelper.cacheDir;
        const srcLocation = path.resolve(cacheDir, this.updateInfo.path);

        const targetLocation = dialog.showSaveDialog(this.browserWindow, {
            title: "Save an update",
            defaultPath: this.updateInfo.path
        });

        try {
            await fs.copy(srcLocation, targetLocation);

            NotificationActionsCreators.createNotification({
                level: "info",
                title: "Succesfully saved file",
                message: `File saved successfully in ${targetLocation}`
            });
        } catch (error) {
            const message: string[] = [
                "An error has occured while saving setup file.",
                `Directory: "${cacheDir}"`,
                `File: "${this.updateInfo.path}"`,
                "",
                `${error}`
            ];

            NotificationActionsCreators.createNotification({
                level: "error",
                title: "Failed to save latest setup file",
                message: message.join("\n")
            });
        }
    }

    private checkForUpdates = () => {
        try {
            autoUpdater.checkForUpdates();
        } catch (error) {
            console.error(`Failed to check for updates.`, error);
        }
    };

    private onError = (error: Error) => {
        if (this.browserWindow == null) {
            return;
        }

        switch (this.updateStatus) {
            case UpdateStatus.Init: {
                console.error("Error on UpdateStatus.Init.", error);
                return;
            }
            case UpdateStatus.Available: {
                // New update is available, but failed to download an update.
                this.onFailedDownload(error);
                return;
            }
            case UpdateStatus.Downloaded: {
                // Update has been downloaded, but failed to be installed.
                this.onFailedInstall(error);
                return;
            }
        }
    };

    private onUpdateAvailable = (info: UpdateInfo) => {
        this.updateInfo = info;
        this.updateStatus = UpdateStatus.Available;
        if (this.browserWindow == null) {
            return;
        }

        UpdateActionsCreators.updateAvailable(info.version, process.platform === "darwin");
    };

    private onUpdateDownloaded = async (info: UpdateInfo) => {
        this.updateInfo = info;
        this.updateStatus = UpdateStatus.Downloaded;

        NotificationActionsCreators.createNotification({
            level: "info",
            title: "Update",
            message: "Update is installing."
        });
        autoUpdater.quitAndInstall();
    };

    private onFailedDownload = (error: Error) => {
        if (this.browserWindow == null) {
            return;
        }
        console.error(error);

        UpdateActionsCreators.updateDownloadFailed();
    };

    private onFailedInstall = async (error: Error) => {
        if (this.browserWindow == null || this.updateInfo == null) {
            return;
        }
        console.error(error);

        UpdateActionsCreators.updateInstallFailed();
    };
}
