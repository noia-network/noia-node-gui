import * as React from "react";
import * as bytes from "bytes";

import { Helpers } from "@global/helpers";
import { FieldBaseProps, SliderFieldView, TextFieldView, SliderLengthRendererHandler } from "@renderer/modules/shared/shared-module";
import { NotificationsActionsCreators } from "@renderer/modules/notifications/notifications-module";

export interface StorageFieldViewChangeHandler {
    (bytes: number): void;
}

enum Status {
    Init = 0,
    Failed = 8,
    Calculated = 16
}

const MIN_BYTES = 1024 ** 2;

interface Props extends FieldBaseProps<number> {
    onChange?: StorageFieldViewChangeHandler;
    path: string | undefined;
}

interface State {
    bytes: number;
    path: string;
    maxBytes: number | undefined;
    tempValue: string;
    status: Status;
}

export class StorageFielView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        let $bytes: number;

        if (props.value != null && !isNaN(props.value)) {
            $bytes = props.value;
        } else if (props.defaultValue != null && !isNaN(props.defaultValue)) {
            $bytes = props.defaultValue;
        } else {
            $bytes = MIN_BYTES;
        }

        this.state = {
            bytes: $bytes,
            maxBytes: undefined,
            path: props.path || "",
            tempValue: bytes.format($bytes),
            status: Status.Init
        };
    }

    public static getDerivedStateFromProps(props: Props, prevState: State): State {
        const calculateValue = (): State => {
            if (props.value == null) {
                return prevState;
            }

            let $bytes = Number(props.value);
            if (isNaN($bytes)) {
                $bytes = MIN_BYTES;
            }

            const value = props.value !== prevState.bytes ? bytes.format($bytes) : prevState.tempValue;

            return {
                ...prevState,
                bytes: $bytes,
                tempValue: value
            };
        };

        const state = calculateValue();

        if (props.path === prevState.path) {
            return state;
        } else {
            return {
                ...state,
                status: Status.Init,
                path: props.path || "",
                maxBytes: undefined
            };
        }
    }

    public componentDidMount(): void {
        this.checkDiskAvailableSize();
    }

    public componentDidUpdate(prevProps: Props): void {
        if (this.state.status === Status.Failed || prevProps.path === this.props.path) {
            return;
        }

        this.checkDiskAvailableSize();
    }

    private async checkDiskAvailableSize(): Promise<void> {
        try {
            const stats = await Helpers.checkDiskSize(this.props.path || "");

            let bytesValue = this.state.bytes;

            if (bytesValue > stats.available) {
                bytesValue = stats.available;
            }

            const bytesString = this.state.bytes !== bytesValue ? bytes.format(bytesValue) : this.state.tempValue;

            this.setState({ bytes: bytesValue, tempValue: bytesString, maxBytes: stats.available, status: Status.Calculated });

            if (this.props.onChange != null) {
                this.props.onChange(bytesValue);
            }
        } catch (error) {
            console.error(error);

            // Cannot send action in the middle of dispatch.
            setTimeout(() =>
                NotificationsActionsCreators.addNotification({
                    level: "error",
                    message: "Failed to calculate disk space. Slider is disabled."
                })
            );

            this.setState({ status: Status.Failed });
        }
    }

    private onSliderChangeEventHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
        const value = Number(event.currentTarget.value);
        this.setState({ bytes: value, tempValue: bytes.format(value) });

        if (this.props.onChange != null) {
            this.props.onChange(value);
        }
    };

    private onInputChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        const value = event.currentTarget.value;
        this.setState({ tempValue: value });
    };

    private onInputBlur: React.FocusEventHandler<HTMLInputElement> = () => {
        let valueInBytes = bytes(this.state.tempValue);

        if (isNaN(valueInBytes)) {
            valueInBytes = this.state.bytes;
        }

        if (this.state.maxBytes != null && valueInBytes > this.state.maxBytes) {
            valueInBytes = this.state.maxBytes;
        } else if (valueInBytes < MIN_BYTES) {
            valueInBytes = MIN_BYTES;
        }

        this.setState({ bytes: valueInBytes, tempValue: bytes.format(valueInBytes) });

        if (this.props.onChange != null) {
            this.props.onChange(valueInBytes);
        }
    };

    private onSliderBlur: React.FocusEventHandler<HTMLInputElement> = () => {
        if (this.props.onChange != null) {
            this.props.onChange(this.state.bytes);
        }
    };

    private rangeRenderer: SliderLengthRendererHandler = length => bytes.format(length);

    public render(): JSX.Element {
        const title = this.state.status === Status.Failed ? "Failed to check storage max size. Slider is disabled." : undefined;
        return (
            <>
                <SliderFieldView
                    name={this.props.name}
                    value={this.state.bytes}
                    min={MIN_BYTES}
                    max={this.state.maxBytes || this.state.bytes}
                    step={1}
                    rangeRenderer={this.rangeRenderer}
                    onChange={this.onSliderChangeEventHandler}
                    onBlur={this.onSliderBlur}
                    disabled={this.state.status === Status.Init || this.state.status === Status.Failed}
                    title={title}
                />
                <TextFieldView
                    name={this.props.name}
                    value={this.state.tempValue}
                    onChange={this.onInputChange}
                    onBlur={this.onInputBlur}
                    disabled={this.state.status === Status.Init}
                />
            </>
        );
    }
}
