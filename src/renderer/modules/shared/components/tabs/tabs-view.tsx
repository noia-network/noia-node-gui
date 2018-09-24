import * as React from "react";
import { NavLink } from "react-router-dom";

import "./tabs-view.scss";

interface Props {
    /**
     * Links to content.
     */
    tabs: JSX.Element | JSX.Element[] | null;
}

export class TabsView extends React.Component<Props> {
    public render(): JSX.Element {
        return (
            <div className="tabs-view">
                {this.props.tabs != null ? <div className="tabs">{this.props.tabs}</div> : null}
                <main>{this.props.children}</main>
            </div>
        );
    }
}
