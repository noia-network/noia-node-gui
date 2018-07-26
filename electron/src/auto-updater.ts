import { shell, dialog, BrowserWindow } from "electron";
import { autoUpdater, UpdateInfo } from "electron-updater";
import * as path from "path";
import * as fs from "fs-extra";

const GITHUB_RELEASES_URL = "https://github.com/noia-network/noia-node-gui/releases";

enum UpdateStatus {
  Init = 0,
  Available = 8,
  Downloaded = 16
}

enum UpdateAvailableDialogButtons {
  UpdateNow = "Update Now",
  Later = "Later"
}

enum UpdateAvailableMacDialogButtons {
  OpenGithub = "Open Github Releases",
  Later = "Later"
}

enum FailedDownloadDialogButtons {
  OpenGithub = "Open Github Releases",
  TryAgain = "Try Again"
}

enum FailedInstallDialogButtons {
  SaveAs = "Save File",
  TryAgain = "Try Again"
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
    this.updateCheckInterval = setInterval(this.checkForUpdates, this.checkIntervalTime);
  }

  public stop(): void {
    if (this.updateCheckInterval != null) {
      clearInterval(this.updateCheckInterval);
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
      const buttons: string[] = [UpdateAvailableMacDialogButtons.OpenGithub, UpdateAvailableMacDialogButtons.Later];

      const buttonIndex = dialog.showMessageBox(this.browserWindow, {
        title: "Update is available",
        message: `New version is available: v${info.version}`,
        buttons: buttons
      });
      if (buttons[buttonIndex] === FailedDownloadDialogButtons.OpenGithub) {
        shell.openExternal(GITHUB_RELEASES_URL);
      }
    } else {
      const buttons: string[] = [UpdateAvailableDialogButtons.UpdateNow, UpdateAvailableDialogButtons.Later];

      const buttonIndex = dialog.showMessageBox(this.browserWindow, {
        title: "Update is available",
        message: `New version is available: v${info.version}`,
        buttons: buttons
      });

      if (buttons[buttonIndex] === UpdateAvailableDialogButtons.UpdateNow) {
        autoUpdater.downloadUpdate();
      }
    }
  };

  private onUpdateDownloaded = async (info: UpdateInfo) => {
    this.updateInfo = info;
    this.updateStatus = UpdateStatus.Downloaded;
    autoUpdater.quitAndInstall();
  };

  private onFailedDownload = (error: Error) => {
    if (this.browserWindow == null) {
      return;
    }

    const buttons: string[] = [FailedDownloadDialogButtons.OpenGithub, FailedDownloadDialogButtons.TryAgain];

    const buttonIndex = dialog.showMessageBox(this.browserWindow, {
      type: "warning",
      title: "Failed to download",
      message: `Failed to download an update.`,
      buttons: buttons
    });

    if (buttons[buttonIndex] === FailedDownloadDialogButtons.OpenGithub) {
      shell.openExternal(GITHUB_RELEASES_URL);
    } else {
      autoUpdater.downloadUpdate();
    }
  };

  private onFailedInstall = async (error: Error) => {
    if (this.browserWindow == null || this.updateInfo == null) {
      return;
    }

    const buttons: string[] = [FailedInstallDialogButtons.SaveAs, FailedDownloadDialogButtons.TryAgain];

    const buttonIndex = dialog.showMessageBox(this.browserWindow, {
      type: "warning",
      title: "Failed to install",
      message: `Failed to install an update. Manual installation needed.`,
      buttons: buttons
    });

    if (buttons[buttonIndex] === FailedInstallDialogButtons.SaveAs) {
      // @ts-ignore // TODO: Fix this hack.
      const cacheDir: string = autoUpdater.downloadedUpdateHelper.cacheDir;
      const srcLocation = path.resolve(cacheDir, this.updateInfo.path);

      const targetLocation = dialog.showSaveDialog(this.browserWindow, {
        title: "Save an update",
        defaultPath: this.updateInfo.path
      });

      try {
        await fs.copy(srcLocation, targetLocation);

        dialog.showMessageBox(this.browserWindow, {
          type: "info",
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

        dialog.showErrorBox("Failed to save latest setup file", message.join("\n"));
      }
    } else {
      autoUpdater.quitAndInstall();
    }
  };
}
