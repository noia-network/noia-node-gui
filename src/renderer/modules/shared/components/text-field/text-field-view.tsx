import * as React from "react";
import * as classNames from "classnames";

import { HtmlFieldBaseProps } from "../../contracts/field-contracts";

import "./text-field-view.scss";

export type TextFieldViewContainerClick = React.MouseEventHandler<HTMLDivElement>;

interface Props extends HtmlFieldBaseProps<HTMLInputElement> {
    className?: string;
    iconSrc?: string;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    placeholder?: string;
    readOnly?: boolean;
    onContainerClick?: TextFieldViewContainerClick;
    onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>;
}

export class TextFieldView extends React.Component<Props> {
    public render(): JSX.Element {
        return (
            <div
                className={classNames("text-field-view", this.props.className, { icon: Boolean(this.props.iconSrc) })}
                onClick={this.props.onContainerClick}
            >
                {this.props.iconSrc != null ? <img className="icon" src={this.props.iconSrc} /> : null}
                <input
                    type="text"
                    name={this.props.name}
                    onChange={this.props.onChange}
                    defaultValue={this.props.defaultValue}
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    onBlur={this.props.onBlur}
                    readOnly={this.props.readOnly}
                    disabled={this.props.disabled}
                    onKeyPress={this.props.onKeyPress}
                />
            </div>
        );
    }
}
