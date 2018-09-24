export interface AppAction {
    type: string;
}

export interface AppDispatcher {
    dispatch<TAction extends AppAction>(action: TAction): void;
    addListener<TAction extends AppAction>(type: TAction["type"], callback: (action: TAction) => void): void;
    removeListener<TAction extends AppAction>(type: TAction["type"], callback: (action: TAction) => void): void;
    removeAllListeners<TAction extends AppAction>(type?: TAction["type"]): void;
}

export const DATA_CHANNEL_NAME = "data-channel";
