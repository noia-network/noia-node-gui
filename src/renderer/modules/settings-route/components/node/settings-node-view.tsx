import * as React from "react";
import * as publicIp from "public-ip";
import { remote } from "electron";
//tslint:disable-next-line:no-require-imports
import isUrl = require("is-url");
import { NodeSettingsDto } from "@noia-network/node-settings";

import { NodeSettingsActionsCreators } from "@renderer/modules/node-settings/node-settings-module";
import { DirectoryFieldView, DirectoryFieldViewChange, CheckboxFieldView } from "@renderer/modules/shared/shared-module";

import { SettingsLayoutView } from "../settings-layout/settings-layout-view";
import { StorageFielView, StorageFieldViewChangeHandler } from "./fields/storage-field-view";
import { PortFieldView, PortFieldViewChangeHandler } from "./fields/port-field-view";
import { NotificationsActionsCreators } from "@renderer/modules/notifications/notifications-module";

interface FormFieldsDto {
    masterAddress: string;
    wrtcControlPort: number;
    wrtcDataPort: number;
    storageDir: string;
    storageSize: number;
    natPmp: boolean;
}

interface Props {
    settings: NodeSettingsDto;
}

interface State {
    fields: FormFieldsDto;
}

export class SettingsNodeView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            fields: {
                masterAddress: props.settings.masterAddress || "",
                wrtcControlPort: props.settings.sockets.wrtc.controlPort,
                wrtcDataPort: props.settings.sockets.wrtc.dataPort,
                storageDir: props.settings.storage.dir,
                storageSize: props.settings.storage.size,
                natPmp: props.settings.natPmp
            }
        };
    }

    private onCheckPort(fieldName: keyof FormFieldsDto, protocol: "udp" | "tcp"): () => void {
        return async () => {
            let resolvedIp: string | undefined;
            const port = this.state.fields[fieldName];

            try {
                resolvedIp = await publicIp.v4();
            } catch (error) {
                NotificationsActionsCreators.addNotification({
                    level: "error",
                    message: "Failed to resolve public ip address."
                });
            }

            if (resolvedIp == null) {
                return;
            }

            remote.shell.openExternal(`https://check-host.net/check-${protocol}?host=${resolvedIp}:${port}`);
        };
    }

    private onSubmit: React.FormEventHandler<HTMLFormElement> = event => {
        event.preventDefault();
        event.stopPropagation();

        const controlPort = this.state.fields.wrtcControlPort;
        const dataPort = this.state.fields.wrtcDataPort;

        if (controlPort === dataPort) {
            NotificationsActionsCreators.addNotification({
                level: "error",
                title: "Form error",
                message: `Ports needs to be different. Control port ${controlPort} and data port ${dataPort}.`
            });
            return;
        }

        NodeSettingsActionsCreators.updateSettings({
            settings: {
                masterAddress: this.state.fields.masterAddress,
                sockets: {
                    wrtc: {
                        controlPort: controlPort,
                        dataPort: dataPort
                    }
                },
                storage: {
                    dir: this.state.fields.storageDir,
                    size: this.state.fields.storageSize
                },
                natPmp: this.state.fields.natPmp
            },
            notify: true,
            restartNode: true
        });
    };

    private onMasterAddressChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        const value = event.currentTarget.value;

        this.setState(state => {
            state.fields.masterAddress = value;
            return state;
        });
    };

    private onMasterAddressBlur = () => {
        this.setState((state, props) => {
            if (!isUrl(state.fields.masterAddress)) {
                state.fields.masterAddress = props.settings.masterAddress || "";
            }

            return state;
        });
    };

    private onPortChange(fieldName: keyof FormFieldsDto): PortFieldViewChangeHandler {
        return value => {
            this.setState(state => {
                state.fields[fieldName] = value;
                return state;
            });
        };
    }

    private onStorageLocationChange: DirectoryFieldViewChange = location => {
        this.setState(state => {
            state.fields.storageDir = location;
            return state;
        });
    };

    private onStorageSizeChange: StorageFieldViewChangeHandler = bytes => {
        if (bytes === 0) {
            bytes = 104857600;
        }
        this.setState(state => {
            state.fields.storageSize = bytes;
            return state;
        });
    };

    private onNatPmpChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        const value = event.target.checked;
        this.setState(state => {
            state.fields.natPmp = value;
            return state;
        });
    };

    public render(): JSX.Element {
        return (
            <SettingsLayoutView onSubmit={this.onSubmit}>
                <div className="row">
                    <label>Master address</label>
                    <div className="field multiple">
                        <input
                            type="text"
                            name="masterAddress"
                            value={this.state.fields.masterAddress}
                            onChange={this.onMasterAddressChange}
                            onBlur={this.onMasterAddressBlur}
                            placeholder="ws://address:port"
                        />
                    </div>
                </div>
                <div className="row">
                    <label>WebRTC control port</label>
                    <div className="field multiple">
                        <PortFieldView
                            name="webrtcControlPort"
                            value={this.state.fields.wrtcControlPort}
                            onChange={this.onPortChange("wrtcControlPort")}
                        />
                        <div>
                            <button type="button" className="button small" onClick={this.onCheckPort("wrtcControlPort", "tcp")}>
                                Check port
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <label>WebRTC data port</label>
                    <div className="field multiple">
                        <PortFieldView
                            name="webrtcDataPort"
                            value={this.state.fields.wrtcDataPort}
                            onChange={this.onPortChange("wrtcDataPort")}
                        />
                        <div>
                            <button type="button" className="button small" onClick={this.onCheckPort("wrtcDataPort", "udp")}>
                                Check port
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <label>Storage directory</label>
                    <DirectoryFieldView
                        name="storageDirectory"
                        value={this.state.fields.storageDir}
                        onChange={this.onStorageLocationChange}
                    />
                </div>
                <div className="row">
                    <label>Storage size</label>
                    <div className="field multiple">
                        <StorageFielView
                            name="storageSize"
                            value={this.state.fields.storageSize}
                            path={this.state.fields.storageDir}
                            onChange={this.onStorageSizeChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label>Enable NAT-PMP</label>
                    <div className="field">
                        <CheckboxFieldView name="natPmp" value={this.state.fields.natPmp} onChange={this.onNatPmpChange} />
                    </div>
                </div>
            </SettingsLayoutView>
        );
    }
}
