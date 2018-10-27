import { Node as NoiaNode, MasterMetadata } from "@noia-network/node";

import { MasterConnectionState } from "../contracts/node";
import { Helpers } from "../helpers";
import { NodeActionsCreators } from "./node/actions/node-actions-creators";
import { NodeStore } from "./node/node-store";
import { NodeDispatcher } from "./node/node-dispatcher";

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

const enum NotificationsId {
    FailedToConnect = "failed-to-connect",
    AutoReconnect = "auto-reconnect"
}

async function main(): Promise<void> {
    console.info(`[NODE] Process has been started ${process.pid}.`);
    // userDataPath: USER_DATA_PATH
    const node = new NoiaNode();
    await node.init();
    NodeActionsCreators.init();

    node.on("warning", message => {
        NotificationActionsCreators.createNotification({
            level: "warning",
            message: message
        });
    });

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

    let timesReconnected: number = 0;
    let reconnectionTimeout: NodeJS.Timer | undefined;
    // Force disconnect only occurs when "Disconnect" button is clicked in renderer.
    let forceDisconnect: boolean = false;

    //#region Settings.
    node.getSettings()
        .getScope("sockets")
        .getScope("wrtc")
        .update("isEnabled", true);

    // Update master address.
    const currentMasterAddress = node.getSettings().get("masterAddress");
    if (currentMasterAddress == null) {
        node.getSettings().update("masterAddress", "ws://csl-masters.noia.network:5565");
    }

    //#endregion

    node.on("started", () => {
        console.info("[NODE] Started");
    });

    node.getContentsClient().on("seeding", async (infoHashes: string[]) => {
        console.info("[NODE] Seeding contents =", infoHashes);
        const storageStats = await node.getStorageSpace().stats();
        console.info("[NODE] Storage usage =", storageStats);
        NodeActionsCreators.updateStorageStats(storageStats);
    });

    NodeActionsCreators.updateConnectionStatus(node.getMaster().connectionState);
    node.getMaster().on("connectionStateChange", () => {
        NodeActionsCreators.updateConnectionStatus(node.getMaster().connectionState);
    });

    // Interval updates from statistics file.
    node.getMaster().on("statistics", stats => {
        NodeActionsCreators.updateTimeConnected(stats.time.total);
        NodeActionsCreators.updateSeedStats({
            totalDownloaded: stats.downloaded,
            totalUploaded: stats.uploaded
        });
    });

    //#region Speed update
    setInterval(() => {
        const contentsClient = node.getContentsClient();

        NodeActionsCreators.updateSpeed({
            download: contentsClient.downloadSpeed,
            upload: contentsClient.uploadSpeed
        });
    }, 1000);
    //#endregion

    //#region Connections update
    const clientSockets = node.getClientSockets();

    // WebSocket
    if (clientSockets.ws != null) {
        clientSockets.ws.on("connections", count => {
            NodeActionsCreators.updateConnectionsCount({
                ws: count
            });
        });
    }
    // WebRTC
    if (clientSockets.wrtc != null) {
        clientSockets.wrtc.on("connections", count => {
            NodeActionsCreators.updateConnectionsCount({
                wrtc: count
            });
        });
    }
    // HTTP
    if (clientSockets.http != null) {
        clientSockets.http.on("connections", count => {
            NodeActionsCreators.updateConnectionsCount({
                http: count
            });
        });
    }
    //#endregion

    //#region Master events
    node.getMaster().on("connected", async info => {
        console.info("[NODE] Connected to master.");
        timesReconnected = 0;
        forceDisconnect = false;
        NotificationActionsCreators.removeNotification(NotificationsId.FailedToConnect);
        NotificationActionsCreators.removeNotification(NotificationsId.AutoReconnect);

        const masterMetadata = info.data.metadata as MasterMetadata;

        if (masterMetadata.externalIp == null) {
            return;
        }

        const webrtcSettings = node
            .getSettings()
            .getScope("sockets")
            .getScope("wrtc");

        const currentIp: string = webrtcSettings.get("dataIp");
        const nextExternalIp: string = masterMetadata.externalIp;

        if (currentIp !== nextExternalIp) {
            webrtcSettings.update("dataIp", nextExternalIp);
            console.info(`[NODE] External IP (wrtcDataIp) changed. From ${currentIp} to ${nextExternalIp}.`);

            await node.stop();
            node.start();
        }
    });

    node.getMaster().on("closed", async info => {
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

        if (!node.getSettings().get("autoReconnect")) {
            return;
        }

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
            setTimeout(async () => node.start(), 1000);
        }, seconds * 1000);
    });
    //#endregion

    //#region Listening actions
    NodeDispatcher.addListener<ConnectAction>("NODE_CONNECT", () => {
        if (NodeStore.getConnectionStatus() !== MasterConnectionState.Connected) {
            node.start();
        }
    });

    NodeDispatcher.addListener<DisconnectAction>("NODE_DISCONNECT", () => {
        forceDisconnect = true;
        const connectionStatus = NodeStore.getConnectionStatus();
        if (connectionStatus !== MasterConnectionState.Connected && connectionStatus !== MasterConnectionState.Connecting) {
            return;
        }

        if (connectionStatus === MasterConnectionState.Connecting) {
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
        const storageStats = await node.getStorageSpace().stats();
        NodeActionsCreators.updateStorageStats(storageStats);
    });

    NodeDispatcher.addListener<RequestNodeSettingsAction>("REQUEST_NODE_SETTINGS", () => {
        NodeActionsCreators.updateSettings(node.getSettings().dehydrate());
    });

    NodeDispatcher.addListener<UpdateNodeSettingsAction>("UPDATE_NODE_SETTINGS", action => {
        node.getSettings().deepUpdate(action.settings);
        NodeActionsCreators.updateSettings(node.getSettings().dehydrate());

        if (action.notify) {
            const restartMessage = action.restartNode ? " Restarting node server..." : "";
            NotificationActionsCreators.createNotification({
                level: "success",
                title: "Settings updated",
                message: `Node settings updated successfully.${restartMessage}`
            });
        }

        if (action.restartNode) {
            NodeActionsCreators.restartNodeProcess();
        }
    });

    //#endregion

    NodeActionsCreators.ready();
    if (node.getSettings().get("autoReconnect")) {
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
