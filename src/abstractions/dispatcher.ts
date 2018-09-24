import { AppDispatcher, AppAction } from "../contracts/dispatcher";
import * as EventEmitter from "events";

export abstract class Dispatcher implements AppDispatcher {
    private eventEmitter: EventEmitter = new EventEmitter();

    public abstract dispatch<TAction extends AppAction>(action: TAction): void;

    protected emit<TAction extends AppAction>(type: TAction["type"], action: TAction): void {
        this.eventEmitter.emit(type, action);
        this.eventEmitter.emit("*", action);
    }

    public addListener<TAction extends AppAction>(type: TAction["type"], callback: (action: TAction) => void): void {
        this.eventEmitter.addListener(type, callback);
    }

    public removeListener<TAction extends AppAction>(type: TAction["type"], callback: (action: TAction) => void): void {
        this.eventEmitter.removeListener(type, callback);
    }

    public removeAllListeners<TAction extends AppAction>(type?: TAction["type"]): void {
        this.eventEmitter.removeAllListeners(type);
    }
}
