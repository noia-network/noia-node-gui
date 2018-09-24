import { AppAction } from "./dispatcher";

export interface ProcessMessageData<TAction extends AppAction> {
    channel: "data-channel";
    action: TAction;
}
