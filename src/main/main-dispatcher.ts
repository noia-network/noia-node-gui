import { ipcMain, BrowserWindow } from "electron";

import { AppAction, DATA_CHANNEL_NAME } from "../contracts/dispatcher";
import { Dispatcher } from "../abstractions/dispatcher";
import { NodeContainer } from "./node-container";

class MainDispatcherClass extends Dispatcher {
    constructor() {
        super();
        ipcMain.on(DATA_CHANNEL_NAME, this.onRendererMessage);

        NodeContainer.addListener("message", this.onNodeMessage);
    }

    /**
     * Emits action to all BrowserWindow.
     */
    private sendToBrowserWindows<TAction extends AppAction>(action: TAction): void {
        for (const $window of BrowserWindow.getAllWindows()) {
            $window.webContents.send(DATA_CHANNEL_NAME, action);
        }
    }

    private onRendererMessage = (_: unknown, action: AppAction) => {
        // console.info("[MAIN-R]", action);
        this.emit(action.type, action);
        NodeContainer.sendAction(action);
    };

    private onNodeMessage = (action: AppAction) => {
        // console.info("[MAIN-N]", action);
        this.emit(action.type, action);
        this.sendToBrowserWindows(action);
    };

    public dispatch<TAction extends AppAction>(action: TAction): void {
        // console.info("[MAIN]", action);
        this.sendToBrowserWindows(action);
        NodeContainer.sendAction(action);
        this.emit(action.type, action);
    }
}

export const MainDispatcher = new MainDispatcherClass();
