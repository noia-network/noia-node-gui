import * as React from "react";
import * as classNames from "classnames";
import { NodeSettingsDto } from "@noia-network/node-settings";

import { Helpers } from "@global/helpers";
import { CheckboxFieldView } from "@renderer/modules/shared/shared-module";
import { NodeSettingsActionsCreators } from "@renderer/modules/node-settings/node-settings-module";

import { SettingsLayoutView } from "../settings-layout/settings-layout-view";

interface FormFieldsDto {
    minimizeToTray: boolean;
}

interface Props {
    settings: NodeSettingsDto;
}

interface State {
    fields: FormFieldsDto;
}

export class SettingsAppView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            fields: {
                minimizeToTray: props.settings.gui.minimizeToTray || false
            }
        };
    }

    private onSubmit: React.FormEventHandler<HTMLFormElement> = event => {
        event.preventDefault();
        NodeSettingsActionsCreators.updateSettings({
            settings: {
                gui: {
                    minimizeToTray: this.state.fields.minimizeToTray
                }
            },
            notify: true,
            restartNode: false
        });
    };

    private onToTrayChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        const value = event.target.checked;

        this.setState(state => {
            state.fields.minimizeToTray = value;
            return state;
        });
    };

    public render(): JSX.Element {
        return (
            <SettingsLayoutView onSubmit={this.onSubmit}>
                <div className={classNames("row", { disabled: !Helpers.IS_WIN32 })}>
                    <label>Minimize to tray</label>
                    <CheckboxFieldView
                        name="toTray"
                        value={this.state.fields.minimizeToTray}
                        onChange={this.onToTrayChange}
                        disabled={!Helpers.IS_WIN32}
                    />
                </div>
            </SettingsLayoutView>
        );
    }
}
