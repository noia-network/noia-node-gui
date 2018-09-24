import * as React from "react";
import * as classNames from "classnames";

import "./settings-layout-view.scss";

interface Props {
    onSubmit?: React.FormEventHandler<HTMLFormElement>;
    className?: string;
}

export class SettingsLayoutView extends React.Component<Props> {
    public render(): JSX.Element {
        return (
            <form className={classNames("settings-layout-view", this.props.className)} onSubmit={this.props.onSubmit}>
                <div className="fields">{this.props.children}</div>
                <div className="control">
                    <button type="submit" className="button">
                        Save
                    </button>
                </div>
            </form>
        );
    }
}
