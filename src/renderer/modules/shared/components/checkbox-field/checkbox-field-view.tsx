import * as React from "react";
import * as classNames from "classnames";

import { HtmlFieldBaseProps } from "../../contracts/field-contracts";

import "./checkbox-field-view.scss";

interface Props extends HtmlFieldBaseProps<HTMLInputElement, boolean> {
    className?: string;
}

export class CheckboxFieldView extends React.Component<Props> {
    public render(): JSX.Element {
        return (
            <label className={classNames("checkbox-field-view", this.props.className)}>
                <input
                    type="checkbox"
                    name={this.props.name}
                    defaultChecked={this.props.defaultValue}
                    disabled={this.props.disabled}
                    checked={this.props.value}
                    onChange={this.props.onChange}
                />
                <span className="check" />
            </label>
        );
    }
}
