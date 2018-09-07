import { dialog, BrowserWindow } from "electron";
import { autoUpdater, UpdateInfo } from "electron-updater";
import * as path from "path";
import * as fs from "fs-extra";

enum UpdateStatus {
  Init = 0,
  Available = 8,
  Downloaded = 16
}

export class AutoUpdater {
  constructor(private readonly browserWindow: BrowserWindow | undefined, private readonly checkIntervalTime: number = 10 * 60 * 1000) {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    autoUpdater.on("error", this.onError);
    autoUpdater.on("update-available", this.onUpdateAvailable);
    autoUpdater.on("update-downloaded", this.onUpdateDownloaded);
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

  public download(): void {
    autoUpdater.downloadUpdate();
    this.browserWindow.webContents.send("alertDownloading");
  }

  public retryInstall(): void {
    autoUpdater.quitAndInstall();
  }

  public async saveUpdate() {
    // @ts-ignore // TODO: Fix this hack.
    const cacheDir: string = autoUpdater.downloadedUpdateHelper.cacheDir;
    const srcLocation = path.resolve(cacheDir, this.updateInfo.path);

    const targetLocation = dialog.showSaveDialog(this.browserWindow, {
      title: "Save an update",
      defaultPath: this.updateInfo.path
    });

    try {
      await fs.copy(srcLocation, targetLocation);

      this.browserWindow.webContents.send("alertSaveSuccess", `File saved successfully in ${targetLocation}`, "Succesfully saved file");
    } catch (error) {
      const message: string[] = [
        "An error has occured while saving setup file.",
        `Directory: "${cacheDir}"`,
        `File: "${this.updateInfo.path}"`,
        "",
        `${error}`
      ];

      this.browserWindow.webContents.send("alertSaveError", message.join("\n"), "Failed to save latest setup file");
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

    if (process.platform === "darwin") {
      this.browserWindow.webContents.send("alertUpdate", `New version is available: v${info.version}`, "Update is available", true, false);
    } else {
      this.browserWindow.webContents.send("alertUpdate", `New version is available: v${info.version}`, "Update is available", false, false);
    }
  };

  private onUpdateDownloaded = async (info: UpdateInfo) => {
    this.updateInfo = info;
    this.updateStatus = UpdateStatus.Downloaded;
    this.browserWindow.webContents.send("alertInstalling");
    autoUpdater.quitAndInstall();
  };

  private onFailedDownload = (error: Error) => {
    if (this.browserWindow == null) {
      return;
    }

    if (process.platform === "darwin") {
      this.browserWindow.webContents.send("alertDownloadFailed", "Failed to download an update.", 'Failed to download', true, true);
    } else {
      this.browserWindow.webContents.send("alertDownloadFailed", "Failed to download an update.", 'Failed to download', false, true);
    }
  };

  private onFailedInstall = async (error: Error) => {
    if (this.browserWindow == null || this.updateInfo == null) {
      return;
    }
    
    this.browserWindow.webContents.send("alertUpdateFailed", "Failed to install an update. Manual installation needed.", 'Failed to install', );
  };
}
