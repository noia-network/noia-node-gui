import * as React from "react";

import { FieldBaseProps, TextFieldView } from "@renderer/modules/shared/shared-module";

const MAX_PORT = 65535;

export interface PortFieldViewChangeHandler {
    (port: number): void;
}

interface Props extends FieldBaseProps<number> {
    onChange: PortFieldViewChangeHandler;
}

interface State {
    value: number;
    tempValue: string;
}

export class PortFieldView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        // Default State
        let value: number;
        if (props.value != null) {
            value = props.value;
        } else if (props.defaultValue != null) {
            value = props.defaultValue;
        } else {
            value = 0;
        }

        this.state = {
            value: value,
            tempValue: value.toString()
        };
    }

    private onChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        const value = event.target.value;
        let port: number = Number(value);

        if (isNaN(port)) {
            return;
        }

        if (value === "") {
            port = 0;
        }

        if (port > MAX_PORT) {
            port = MAX_PORT;
        }

        this.setState({ value: port, tempValue: value });
    };

    private onBlur: React.FocusEventHandler<HTMLInputElement> = () => {
        if (this.props.onChange != null) {
            this.props.onChange(this.state.value);
        }

        this.setState(state => ({
            ...state,
            tempValue: state.value.toString()
        }));
    };

    public render(): JSX.Element {
        return (
            <TextFieldView
                name="webrtcDataPort"
                value={this.state.tempValue}
                onChange={this.onChange}
                onBlur={this.onBlur}
                iconSrc="static/icon-port.svg"
            />
        );
    }
}
