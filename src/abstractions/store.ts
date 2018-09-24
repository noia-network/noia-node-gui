import { Dispatcher } from "./dispatcher";
import { AppAction } from "../contracts/dispatcher";

export type StoreActionHandler<TAction extends AppAction, TState> = (action: TAction, state: TState) => TState;

export abstract class Store<TState> {
    constructor(protected readonly dispatcher: Dispatcher) {}

    private state: TState = this.getInitialState();

    public abstract getInitialState(): TState;
    public getState(): TState {
        return this.state;
    }

    protected registerAction<TAction extends AppAction>(type: TAction["type"], callback: StoreActionHandler<TAction, TState>): void {
        this.dispatcher.addListener(type, action => {
            this.state = callback(action, this.state);
        });
    }
}
