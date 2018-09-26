import * as React from "react";
import * as publicIp from "public-ip";
import { remote } from "electron";

import { NodeSettingsKeys } from "@global/contracts/node-settings";
import { NodeSettingsActionsCreators } from "@renderer/modules/node-settings/node-settings-module";
import { DirectoryFieldView, DirectoryFieldViewChange, CheckboxFieldView } from "@renderer/modules/shared/shared-module";

import { SettingsLayoutView } from "../settings-layout/settings-layout-view";
import { StorageFielView, StorageFieldViewChangeHandler } from "./fields/storage-field-view";
import { PortFieldView, PortFieldViewChangeHandler } from "./fields/port-field-view";
import { NotificationsActionsCreators } from "@renderer/modules/notifications/notifications-module";

interface FormFieldsDto {
    [NodeSettingsKeys.WrtcControlPort]: number;
    [NodeSettingsKeys.WrtcDataPort]: number;
    [NodeSettingsKeys.StorageDir]: string;
    [NodeSettingsKeys.StorageSize]: number;
    [NodeSettingsKeys.NatPmp]: boolean;
}

interface Props {
    settings: { [key: string]: unknown };
}

interface State {
    fields: FormFieldsDto;
}

export class SettingsNodeView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            fields: {
                [NodeSettingsKeys.WrtcControlPort]: 8048,
                [NodeSettingsKeys.WrtcDataPort]: 8058,
                [NodeSettingsKeys.StorageDir]: "",
                [NodeSettingsKeys.StorageSize]: 1024 ** 3,
                [NodeSettingsKeys.NatPmp]: false,
                ...props.settings
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

        const controlPort = this.state.fields[NodeSettingsKeys.WrtcControlPort];
        const dataPort = this.state.fields[NodeSettingsKeys.WrtcDataPort];

        if (controlPort === dataPort) {
            NotificationsActionsCreators.addNotification({
                level: "error",
                title: "Form error",
                message: `Ports needs to be different. Control port ${controlPort} and data port ${dataPort}.`
            });
            return;
        }

        NodeSettingsActionsCreators.updateSettings(this.state.fields, true);
    };

    private onPortChange(fieldName: NodeSettingsKeys.WrtcDataPort | NodeSettingsKeys.WrtcControlPort): PortFieldViewChangeHandler {
        return value => {
            this.setState(state => {
                state.fields[fieldName] = value;
                return state;
            });
        };
    }

    private onStorageLocationChange: DirectoryFieldViewChange = location => {
        this.setState(state => {
            state.fields[NodeSettingsKeys.StorageDir] = location;
            return state;
        });
    };

    private onStorageSizeChange: StorageFieldViewChangeHandler = bytes => {
        this.setState(state => {
            state.fields[NodeSettingsKeys.StorageSize] = bytes;
            return state;
        });
    };

    private onNatPmpChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        const value = event.target.checked;

        this.setState(state => {
            state.fields[NodeSettingsKeys.NatPmp] = value;
            return state;
        });
    };

    public render(): JSX.Element {
        return (
            <SettingsLayoutView onSubmit={this.onSubmit}>
                <div className="row">
                    <label>WebRTC control port</label>
                    <div className="field multiple">
                        <PortFieldView
                            name="webrtcControlPort"
                            value={this.state.fields[NodeSettingsKeys.WrtcControlPort]}
                            onChange={this.onPortChange(NodeSettingsKeys.WrtcControlPort)}
                        />
                        <div>
                            <button
                                type="button"
                                className="button small"
                                onClick={this.onCheckPort(NodeSettingsKeys.WrtcControlPort, "tcp")}
                            >
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
                            value={this.state.fields[NodeSettingsKeys.WrtcDataPort]}
                            onChange={this.onPortChange(NodeSettingsKeys.WrtcDataPort)}
                        />
                        <div>
                            <button
                                type="button"
                                className="button small"
                                onClick={this.onCheckPort(NodeSettingsKeys.WrtcControlPort, "udp")}
                            >
                                Check port
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <label>Storage directory</label>
                    <DirectoryFieldView
                        name="storageDirectory"
                        value={this.state.fields[NodeSettingsKeys.StorageDir]}
                        onChange={this.onStorageLocationChange}
                    />
                </div>
                <div className="row">
                    <label>Storage size</label>
                    <div className="field multiple">
                        <StorageFielView
                            name="storageSize"
                            value={Number(this.state.fields[NodeSettingsKeys.StorageSize])}
                            path={this.state.fields[NodeSettingsKeys.StorageDir]}
                            onChange={this.onStorageSizeChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label>Enable NAT-PMP</label>
                    <div className="field">
                        <CheckboxFieldView
                            name="natPmp"
                            value={this.state.fields[NodeSettingsKeys.NatPmp]}
                            onChange={this.onNatPmpChange}
                        />
                    </div>
                </div>
            </SettingsLayoutView>
        );
    }
}
