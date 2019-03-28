import { app, BrowserWindow, Menu, Tray } from "electron";
import * as url from "url";
import * as path from "path";
import * as dotenv from "dotenv";

import { NodeReadyAction } from "../contracts/node-actions";
import { RequestNodeProcessRestartAction } from "../contracts/shared-actions";

import { MainDispatcher } from "./main-dispatcher";
import { NodeContainer } from "./node-container";
import { AutoUpdater } from "./auto-updater";
import { NodeActionsCreators } from "./node-actions-creators";
import { NotificationActionsCreators } from "./notifications-actions-creators";
import { NodeSettingsStore } from "./node-settings-store";
import { DownloadUpdateAction, SaveUpdateAction } from "contracts/main-actions";

const APP_PATH: string = app.getPath("userData");

dotenv.config({ path: APP_PATH });

const IS_SERVE: boolean = process.argv.indexOf("--serve") !== -1;
const APP_ICON_LOCATION: string = path.join(__dirname, "../../assets/noia-icon.png");
const DEV_PORT: number = 4000;

let tray: Tray | undefined;
let browserWindow: BrowserWindow | undefined;
let updater: AutoUpdater | undefined;

const SHOULD_QUIT = app.makeSingleInstance(() => {
    if (browserWindow) {
        if (browserWindow.isMinimized()) {
            browserWindow.restore();
        }
        browserWindow.focus();
    }
});

if (SHOULD_QUIT) {
    app.quit();
    process.exit(0);
}

function createTray(onClose: () => void): Tray | undefined {
    if (process.platform !== "win32") {
        return undefined;
    }

    tray = new Tray(APP_ICON_LOCATION);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show/Hide",
            click: () => {
                if (browserWindow == null) {
                    return;
                }

                if (browserWindow.isVisible()) {
                    browserWindow.hide();
                } else {
                    browserWindow.show();
                }
            }
        },
        { type: "separator" },
        {
            label: "Quit",
            click: onClose
        }
    ]);
    tray.setToolTip("NOIA Network Node");
    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
        if (browserWindow == null) {
            return;
        }

        if (browserWindow.isVisible()) {
            browserWindow.hide();
        } else {
            browserWindow.show();
        }
    });

    return tray;
}

app.on("ready", () => {
    NodeContainer.start();
    NodeContainer.addListener("exit", (code, signal) => {
        NodeActionsCreators.nodeExited();

        if (code === 0) {
            return;
        }

        const signalString = signal != null ? `, Signal: ${signal}` : "";
        NotificationActionsCreators.createNotification({
            level: "error",
            message: `Node process has exited unexpectedly. Code: ${code}${signalString}. Restarting...`
        });
    });

    browserWindow = new BrowserWindow({
        resizable: false,
        useContentSize: true,
        title: "NOIA Node",
        icon: APP_ICON_LOCATION,
        x: 0,
        y: 0,
        width: 730,
        height: 500
    });

    tray = createTray(async () => {
        await NodeContainer.stop();
        process.exit(0);
    });

    if (process.argv.indexOf("--debug") !== -1) {
        browserWindow.webContents.openDevTools();
    }

    updater = new AutoUpdater(browserWindow);
    updater.start();

    browserWindow.on("close", event => {
        if (process.platform === "win32" && NodeSettingsStore.minimizeToTray) {
            event.preventDefault();
            if (browserWindow == null) {
                return;
            }

            browserWindow.hide();
        }
    });

    // Emitted when the window is closed.
    browserWindow.on("closed", async () => {
        await NodeContainer.stop();
        process.exit(0);
    });

    if (process.platform === "darwin") {
        // Create our menu entries so that we can use MAC shortcuts
        Menu.setApplicationMenu(
            Menu.buildFromTemplate([
                {
                    label: "Edit",
                    submenu: [
                        { role: "undo" },
                        { role: "redo" },
                        { type: "separator" },
                        { role: "cut" },
                        { role: "copy" },
                        { role: "paste" },
                        { role: "pasteandmatchstyle" },
                        { role: "delete" },
                        { role: "selectall" }
                    ]
                }
            ])
        );
    } else {
        browserWindow.setMenu(null);
    }

    if (IS_SERVE) {
        browserWindow.loadURL(`http://localhost:${DEV_PORT}`);
    } else {
        browserWindow.loadURL(
            url.format({
                pathname: path.resolve(__dirname, "../renderer/index.html"),
                protocol: "file:",
                slashes: true
            })
        );
    }

    MainDispatcher.addListener<NodeReadyAction>("NODE_READY", () => {
        NodeActionsCreators.requestNodeSettings();
    });

    MainDispatcher.addListener<RequestNodeProcessRestartAction>("REQUEST_NODE_PROCESS_RESTART", async () => {
        await NodeContainer.restart();
    });

    //#region Updates
    MainDispatcher.addListener<DownloadUpdateAction>("DOWNLOAD_UPDATE", () => {
        if (updater == null) {
            return;
        }

        updater.download();
    });

    MainDispatcher.addListener<SaveUpdateAction>("SAVE_UPDATE", () => {
        if (updater == null) {
            return;
        }

        updater.saveUpdate();
    });
    //#endregion
});
