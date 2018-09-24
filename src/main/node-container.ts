import * as path from "path";
import { app } from "electron";
import { fork, ChildProcess } from "child_process";
import { StrictEventEmitter } from "strict-event-emitter-types";
import * as EventEmitter from "events";

import { AppAction } from "../contracts/dispatcher";
import { ProcessMessageData } from "../contracts/process-communication";

const enum Status {
    Init = 0,
    Started = 8,
    Stopped = 16,
    ForceStopped = 32
}

interface Events {
    message: (action: AppAction) => void;
    error: (error: Error) => void;
    exit: (code: number, signal?: string) => void;
}

const StrictNodeEventEmitter: { new (): StrictEventEmitter<EventEmitter, Events> } = EventEmitter;

class NodeContainerClass extends StrictNodeEventEmitter {
    constructor() {
        super();
    }

    protected process: ChildProcess | undefined;

    private internalStatus: Status = Status.Init;

    public getStatus(): Status {
        return this.internalStatus;
    }

    public start(): void {
        if (this.process != null) {
            return;
        }

        this.createProcess();
    }

    public async stop(): Promise<void> {
        this.internalStatus = Status.ForceStopped;
        return new Promise<void>((resolve, reject) => {
            if (this.process == null) {
                resolve();
                return;
            }
            this.process.once("exit", code => {
                if (code === 0) {
                    resolve();
                } else {
                    reject();
                }
            });

            this.process.send("KILL", error => {
                if (error != null) {
                    reject(error);
                }
            });
        });
    }

    public async restart(): Promise<void> {
        await NodeContainer.stop();
        NodeContainer.start();
    }

    public sendAction(action: AppAction): void {
        if (this.process == null || !this.process.connected) {
            return;
        }

        const data: ProcessMessageData<AppAction> = {
            channel: "data-channel",
            action: action
        };

        try {
            this.process.send(data);
        } catch (error) {
            console.error(error);
        }
    }

    private createProcess(): void {
        this.internalStatus = Status.Started;
        const childProcess = fork(path.join(__dirname, "../processes/node.process"), [], {
            env: {
                ...process.env,
                USER_DATA_PATH: app.getPath("userData")
            }
        });
        this.process = childProcess;
        childProcess.on("message", this.onMessage);
        childProcess.on("error", this.onError);
        childProcess.on("exit", this.onExit);
    }

    private onMessage = (message: ProcessMessageData<AppAction>) => {
        if (message.channel !== "data-channel") {
            return;
        }

        this.emit("message", message.action);
    };

    private onError = (error: Error) => {
        this.internalStatus = Status.Stopped;
        this.emit("error", error);
        console.error("[NodeContainer]", error);

        if (this.process != null) {
            this.process.removeAllListeners();
            this.process = undefined;
        }

        this.createProcess();
    };

    private onExit = (code: number, signal?: string) => {
        this.internalStatus = Status.Stopped;
        this.emit("exit", code, signal);

        if (this.process != null) {
            this.process.removeAllListeners();
            this.process = undefined;
        }

        // Node process exited normally.
        if (code === 0) {
            return;
        }

        console.error(`[NodeContainer] Process exited unexpectedly. Exit: ${code}, Signal: ${signal}.`);

        this.createProcess();
    };
}

export const NodeContainer = new NodeContainerClass();
