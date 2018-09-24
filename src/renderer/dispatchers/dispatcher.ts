import { ipcRenderer } from "electron";
import { Dispatcher as FluxDispatcher } from "simplr-flux";

import { AppAction, DATA_CHANNEL_NAME } from "@global/contracts/dispatcher";
import { Dispatcher } from "@global/abstractions/dispatcher";

class RendererDispatcherClass extends Dispatcher {
    constructor() {
        super();
        ipcRenderer.on(DATA_CHANNEL_NAME, this.onMessage);
    }

    private onMessage = (_: unknown, action: AppAction) => {
        this.emit(action.type, action);
        setTimeout(() => FluxDispatcher.dispatch(action));
    };

    public dispatch<TAction extends AppAction>(action: TAction): void {
        ipcRenderer.send(DATA_CHANNEL_NAME, action);
        setTimeout(() => FluxDispatcher.dispatch<TAction>(action));
    }
}

export const RendererDispatcher = new RendererDispatcherClass();
