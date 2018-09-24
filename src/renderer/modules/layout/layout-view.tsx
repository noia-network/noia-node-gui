import * as React from "react";
import { NavLink } from "react-router-dom";

import { NotificationsHandler } from "@renderer/modules/notifications/notifications-module";

import "./layout-view.scss";

export class LayoutView extends React.Component {
    public render(): JSX.Element {
        return (
            <>
                <NotificationsHandler />
                <div className="layout-view">
                    <aside>
                        <div className="wrapper">
                            <ul className="navigation">
                                <li>
                                    <NavLink to="/node" className="navigation-item" activeClassName="active">
                                        Node
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/wallet" className="navigation-item" activeClassName="active">
                                        Wallet
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/settings" className="navigation-item" activeClassName="active">
                                        Settings
                                    </NavLink>
                                </li>
                            </ul>
                            <div className="bottom">
                                <img className="logo" src="./static/noia-logo.svg" alt="NOIA Logo" />
                                <div className="version">v{__APPVERSION__}</div>
                            </div>
                        </div>
                    </aside>
                    <main>{this.props.children}</main>
                </div>
            </>
        );
    }
}
