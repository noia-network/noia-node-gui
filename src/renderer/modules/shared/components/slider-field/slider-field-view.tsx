import * as React from "react";
import * as classNames from "classnames";

import { HtmlFieldBaseProps } from "../../contracts/field-contracts";

import "./slider-field-view.scss";

export interface SliderLengthRendererHandler {
    (length: number): React.ReactNode;
}

interface Props extends HtmlFieldBaseProps<HTMLInputElement, number> {
    className?: string;
    min: number;
    max: number;
    step: number | "any";
    rangeRenderer?: SliderLengthRendererHandler;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    title?: string;
}

export class SliderFieldView extends React.Component<Props> {
    public render(): JSX.Element {
        return (
            <div
                className={classNames("slider-field-view", this.props.className, { disabled: this.props.disabled })}
                title={this.props.title}
            >
                {this.props.rangeRenderer != null ? <span className="lenght-label">{this.props.rangeRenderer(this.props.min)}</span> : null}
                <input
                    type="range"
                    name={this.props.name}
                    onChange={this.props.onChange}
                    defaultValue={this.props.defaultValue != null ? this.props.defaultValue.toString() : undefined}
                    value={this.props.value}
                    min={this.props.min}
                    max={this.props.max}
                    step={this.props.step}
                    onBlur={this.props.onBlur}
                    disabled={this.props.disabled}
                />
                {this.props.rangeRenderer != null ? <span className="lenght-label">{this.props.rangeRenderer(this.props.max)}</span> : null}
            </div>
        );
    }
}
