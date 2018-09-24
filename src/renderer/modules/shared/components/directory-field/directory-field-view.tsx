import * as React from "react";
import { remote } from "electron";

import { FieldBaseProps } from "../../contracts/field-contracts";
import { TextFieldView, TextFieldViewContainerClick } from "../text-field/text-field-view";

const ENTER_KEYCODE = 13;

export interface DirectoryFieldViewChange {
    (location: string): void;
}

interface Props extends FieldBaseProps<string> {
    onChange?: DirectoryFieldViewChange;
}

interface State {
    value: string;
}

export class DirectoryFieldView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        // Default State
        let value: string;
        if (this.props.value != null) {
            value = this.props.value;
        } else if (this.props.defaultValue != null) {
            value = this.props.defaultValue;
        } else {
            value = "";
        }

        this.state = {
            value: value
        };
    }

    public static getDerivedStateFromProps(props: Props, prevState: State): State {
        if (props.value == null) {
            return prevState;
        }

        return {
            value: props.value
        };
    }

    private openDialog(): void {
        if (this.props.disabled) {
            return;
        }

        const folders = remote.dialog.showOpenDialog({
            properties: ["openDirectory"]
        });

        if (folders != null) {
            const selectedFolder = folders[0];
            this.setState({ value: folders[0] });

            if (this.props.onChange != null) {
                this.props.onChange(selectedFolder);
            }
        }
    }

    private onClick: TextFieldViewContainerClick = () => {
        this.openDialog();
    };

    private onKeyPress: React.KeyboardEventHandler<HTMLInputElement> = event => {
        if (event.charCode === ENTER_KEYCODE) {
            event.preventDefault();
            event.stopPropagation();
            this.openDialog();
        }
    };

    public render(): JSX.Element {
        return (
            <TextFieldView
                name={this.props.name}
                value={this.state.value}
                placeholder="No directory has been selected."
                readOnly={true}
                disabled={this.props.disabled}
                className="directory-field-view"
                onContainerClick={this.onClick}
                onKeyPress={this.onKeyPress}
                iconSrc="static/icon-browse.svg"
            />
        );
    }
}
