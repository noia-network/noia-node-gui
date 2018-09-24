import { Dispatcher } from "../abstractions/dispatcher";
import { AppAction } from "../contracts/dispatcher";
import { ProcessMessageData } from "../contracts/process-communication";

export class ProcessDispatcher extends Dispatcher {
    constructor() {
        super();
        process.on("message", this.onMessage);
    }

    private onMessage = (message: ProcessMessageData<AppAction>) => {
        if (message.channel !== "data-channel") {
            return;
        }

        this.emit(message.action.type, message.action);
    };

    public dispatch<TAction extends AppAction>(action: TAction): void {
        if (process.send == null) {
            return;
        }

        const message: ProcessMessageData<AppAction> = {
            channel: "data-channel",
            action: action
        };

        process.send(message);
        this.emit(message.action.type, message.action);
    }
}
