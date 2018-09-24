// tslint:disable-next-line:no-require-imports
import NoiaNode = require("@noia-network/node");
import * as path from "path";

import { NodeConnection, StorageStats } from "../contracts/node-actions";
import { Helpers } from "../helpers";
import { NodeActionsCreators } from "./node/actions/node-actions-creators";
import { NodeStore } from "./node/node-store";
import { NodeDispatcher } from "./node/node-dispatcher";
import { GuiSettingsHandler, GuiSettings } from "./node/gui-settings";

import { ConnectAction, DisconnectAction, RequestStorageStatsAction } from "../contracts/renderer-actions";
import { NotificationActionsCreators } from "./node/actions/notifications-actions-creators";
import { RequestNodeSettingsAction, UpdateNodeSettingsAction } from "contracts/shared-actions";

process.on("unhandledRejection", error => {
    NotificationActionsCreators.createNotification({
        level: "error",
        title: "Critical error",
        message: error.message,
        autoDismiss: 0
    });

    throw error;
});

const USER_DATA_PATH: string = process.env.USER_DATA_PATH!;

const enum NotificationsId {
    FailedToConnect = "failed-to-connect",
    AutoReconnect = "auto-reconnect"
}

interface NodeOnConnectedDto {
    params: {
        externalIp: string;
    };
}

interface NodeOnClosedDto {
    code: number;
    reason?: string;
}

function getSettings(node: NoiaNode, guiSettings: GuiSettingsHandler<GuiSettings>): { [key: string]: unknown } {
    const nodeAllSettings = node.settings.settings;
    const guiAllSettings = guiSettings.getAllSettings();

    const prefixedGuiSettings: { [key: string]: unknown } = {};

    for (const key of Object.keys(guiAllSettings)) {
        prefixedGuiSettings[`gui.${key}`] = guiAllSettings[key];
    }

    return {
        ...nodeAllSettings,
        ...prefixedGuiSettings
    };
}

/**
 * @returns Update required.
 */
function updateSettings(node: NoiaNode, guiSettings: GuiSettingsHandler<GuiSettings>, settings: { [key: string]: unknown }): boolean {
    const keys = Object.keys(settings);
    const guiSettingsKeys = keys.filter(x => x.indexOf("gui.") === 0);
    const nodeSettingsKeys = keys.filter(x => x.indexOf("gui.") === -1);
    let restartRequired: boolean = false;

    for (const key of guiSettingsKeys) {
        const keyString = key.replace("gui.", "");
        if (Helpers.isEqual(guiSettings.getAllSettings()[keyString], settings[key])) {
            continue;
        }

        // tslint:disable-next-line:no-any
        guiSettings.update(keyString as any, settings[key]);
    }

    for (const key of nodeSettingsKeys) {
        if (Helpers.isEqual(node.settings.settings[key], settings[key])) {
            continue;
        }

        restartRequired = true;
        // tslint:disable-next-line:no-any
        node.settings.update(key as any, settings[key]);
    }

    return restartRequired;
}

async function main(): Promise<void> {
    NodeActionsCreators.init();
    console.info(`[NODE] Process has been started ${process.pid}.`);
    const node = new NoiaNode({
        userDataPath: USER_DATA_PATH
    });
    const guiSettings = await GuiSettingsHandler.init(path.resolve(USER_DATA_PATH, "settings-gui.json"));

    NodeActionsCreators.updateConnectionStatus(NodeConnection.Disonnected);

    let timesReconnected: number = 0;
    let reconnectionTimeout: NodeJS.Timer | undefined;
    // Force disconnect only occurs when "Disconnect" button is clicked in renderer.
    let forceDisconnect: boolean = false;

    //#region Settings.
    node.settings.update(node.settings.Options.wrtc, true);

    // Update master address.
    const currentMasterAddress = node.settings.get(node.settings.Options.masterAddress);
    if (currentMasterAddress == null || currentMasterAddress === "") {
        node.settings.update(node.settings.Options.masterAddress, "ws://csl-masters.noia.network:5565");
    }

    // GUI Settings
    await guiSettings.ensure("minimizeToTray", false);
    await guiSettings.ensure("autoReconnect", false);
    //#endregion

    node.on("started", () => {
        console.info("[NODE] Started");
    });

    node.contentsClient.on("seeding", async (infoHashes: string[]) => {
        console.info("[NODE] Seeding contents =", infoHashes);
        const storageStats = (await node.storageSpace.stats()) as StorageStats;
        console.info("[NODE] Storage usage =", storageStats);
        NodeActionsCreators.updateStorageStats(storageStats);
    });

    // Interval updates from statistics file.
    setInterval(() => {
        const totalTimeConnected = node.statistics.get(node.statistics.Options.totalTimeConnected);
        NodeActionsCreators.updateTimeConnected(totalTimeConnected);

        const totalDownloaded = node.statistics.get(node.statistics.Options.totalDownloaded);
        const totalUploaded = node.statistics.get(node.statistics.Options.totalUploaded);
        NodeActionsCreators.updateSeedStats({
            totalDownloaded: totalDownloaded,
            totalUploaded: totalUploaded
        });
    }, 1000);

    //#region Speed update
    setInterval(() => {
        NodeActionsCreators.updateSpeed({
            download: node.contentsClient.downloadSpeed,
            upload: node.contentsClient.uploadSpeed
        });
    }, 1000);
    //#endregion

    //#region Connections update
    // WebSocket
    if (node.clientSockets.ws != null) {
        node.clientSockets.ws.on("connections", count => {
            NodeActionsCreators.updateConnectionsCount({
                ws: count
            });
        });
    }
    // WebRTC
    if (node.clientSockets.wrtc != null) {
        node.clientSockets.wrtc.on("connections", count => {
            NodeActionsCreators.updateConnectionsCount({
                wrtc: count
            });
        });
    }
    // HTTP
    if (node.clientSockets.http != null) {
        node.clientSockets.http.on("connections", count => {
            NodeActionsCreators.updateConnectionsCount({
                http: count
            });
        });
    }
    //#endregion

    //#region Master events
    node.master.on("connected", async (info: NodeOnConnectedDto) => {
        timesReconnected = 0;
        forceDisconnect = false;
        NotificationActionsCreators.removeNotification(NotificationsId.FailedToConnect);
        NotificationActionsCreators.removeNotification(NotificationsId.AutoReconnect);
        NodeActionsCreators.updateConnectionStatus(NodeConnection.Connected);

        if (info == null || info.params == null || info.params.externalIp == null) {
            return;
        }

        const currentIp: string = node.settings.settings[node.settings.Options.wrtcDataIp];
        const nextExternalIp: string = info.params.externalIp;

        if (currentIp !== nextExternalIp) {
            node.settings.update(node.settings.Options.wrtcDataIp, info.params.externalIp);
            console.info(`[noia-node] External IP (wrtcDataIp) changed. From ${currentIp} to ${nextExternalIp}.`);

            await node.stop();
            node.start();
        }
    });

    node.master.on("closed", async (info?: NodeOnClosedDto) => {
        NodeActionsCreators.updateConnectionStatus(NodeConnection.Disonnected);

        if (forceDisconnect) {
            return;
        }

        if (info != null && info.code === 1000) {
            console.info(`[NODE]: connection with master closed, normal exit`);
            return;
        }

        if (info != null && info.code === 1002 && info.reason != null) {
            console.error(`[NODE]: connection with master closed, info =`, info);
            NotificationActionsCreators.createNotification({
                level: "error",
                title: "Connection closed with master.",
                message: info.reason
            });
        }

        const isInternetConnectionAvailable = await Helpers.isInternetConnectionAvailable();
        if (isInternetConnectionAvailable) {
            console.error("error:", "[noia-node] Failed to connect to the master.");
            NotificationActionsCreators.createNotification({
                uid: NotificationsId.FailedToConnect,
                level: "error",
                message: "Failed to connect to the master."
            });
        } else {
            console.error("error:", "[noia-node] No internet connection, please connect to the internet.");
            NotificationActionsCreators.createNotification({
                uid: NotificationsId.FailedToConnect,
                level: "error",
                message: "No internet connection, please connect to the internet."
            });
        }

        if (!guiSettings.get("autoReconnect")) {
            return;
        }
        NodeActionsCreators.updateConnectionStatus(NodeConnection.Connecting);

        const seconds = (timesReconnected + 1) * 5;
        timesReconnected++;
        console.info("info:", `[noia-node] Will try to reconnect in ${seconds} seconds.`);
        NotificationActionsCreators.createNotification({
            uid: NotificationsId.AutoReconnect,
            level: "info",
            message: `Will try to reconnect in ${seconds} seconds.`,
            autoDismiss: 0
        });

        reconnectionTimeout = setTimeout(() => {
            NotificationActionsCreators.removeNotification(NotificationsId.FailedToConnect);
            NotificationActionsCreators.removeNotification(NotificationsId.AutoReconnect);
            // We need to wait for notifications to get removed first.
            setTimeout(() => node.start(), 1000);
        }, seconds * 1000);
    });

    node.master.once("warning", info => {
        NotificationActionsCreators.createNotification({
            level: "warning",
            uid: "master-warning",
            title: "Master",
            message: info.message
        });
    });
    //#endregion

    node.on("error", (error: Error & { code?: string; port?: number }) => {
        let errorMessage: string = error.message;
        if (error.code === "EADDRINUSE") {
            errorMessage = `Port ${error.port} is already in use. Please choose another port.`;
        }

        NotificationActionsCreators.createNotification({
            level: "error",
            message: errorMessage
        });
    });

    //#region Listening actions
    NodeDispatcher.addListener<ConnectAction>("NODE_CONNECT", () => {
        if (NodeStore.getConnectionStatus() !== NodeConnection.Connected) {
            node.start();
        }
    });

    NodeDispatcher.addListener<DisconnectAction>("NODE_DISCONNECT", () => {
        forceDisconnect = true;
        const connectionStatus = NodeStore.getConnectionStatus();
        if (connectionStatus !== NodeConnection.Connected && connectionStatus !== NodeConnection.Connecting) {
            return;
        }

        if (connectionStatus === NodeConnection.Connecting) {
            NodeActionsCreators.updateConnectionStatus(NodeConnection.Disonnected);
            NotificationActionsCreators.removeNotification(NotificationsId.FailedToConnect);
            NotificationActionsCreators.removeNotification(NotificationsId.AutoReconnect);
            if (reconnectionTimeout != null) {
                timesReconnected = 0;
                clearTimeout(reconnectionTimeout);
            }
        }

        node.stop();
    });

    NodeDispatcher.addListener<RequestStorageStatsAction>("NODE_REQUEST_STORAGE_STATS", async () => {
        const storageStats = (await node.storageSpace.stats()) as StorageStats;
        NodeActionsCreators.updateStorageStats(storageStats);
    });

    NodeDispatcher.addListener<RequestNodeSettingsAction>("REQUEST_NODE_SETTINGS", () => {
        const settings = getSettings(node, guiSettings);

        NodeActionsCreators.updateSettings(settings);
    });

    NodeDispatcher.addListener<UpdateNodeSettingsAction>("UPDATE_NODE_SETTINGS", action => {
        const restartRequired = updateSettings(node, guiSettings, action.settings);
        const settings = getSettings(node, guiSettings);

        NodeActionsCreators.updateSettings(settings);

        if (action.notify) {
            const restartRequiredString = restartRequired ? "Restarting node server..." : "";

            NotificationActionsCreators.createNotification({
                level: "success",
                message: `Updated settings succesfully. ${restartRequiredString}`
            });
        }

        if (restartRequired) {
            NodeActionsCreators.restartNodeProcess();
        }
    });

    //#endregion

    NodeActionsCreators.ready();
    if (guiSettings.get("autoReconnect")) {
        node.start();
    }
}

// Kill switch.
process.on("message", message => {
    if (message === "KILL") {
        process.exit(0);
    }
});

main();
