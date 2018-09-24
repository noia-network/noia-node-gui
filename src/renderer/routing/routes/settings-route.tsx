import * as React from "react";
import { Switch, Route, RouteComponentProps, Redirect, NavLink } from "react-router-dom";
import * as path from "path";

import { TabsView } from "@renderer/modules/shared/shared-module";

import { NodeSettingsRoute } from "./settings/node-settings-route";
import { AppSettingsRoute } from "./settings/app-settings-route";

const IS_WIN32: boolean = process.platform === "win32";

export class SettingsRoute extends React.Component<RouteComponentProps<{}>> {
    public render(): JSX.Element {
        const nodeSettingsPath = path.posix.join(this.props.match.url, "node");
        const appSettingsPath = path.posix.join(this.props.match.url, "app");

        const tabs: JSX.Element = (
            <>
                <NavLink to={nodeSettingsPath} className="tab-item" activeClassName="active">
                    Node
                </NavLink>
                {IS_WIN32 ? (
                    <NavLink to={appSettingsPath} className="tab-item" activeClassName="active">
                        Application
                    </NavLink>
                ) : null}
            </>
        );

        return (
            <TabsView tabs={tabs}>
                <Switch>
                    <Route path={nodeSettingsPath} component={NodeSettingsRoute} />
                    <Route path={appSettingsPath} component={AppSettingsRoute} />
                    <Redirect to={nodeSettingsPath} />
                </Switch>
            </TabsView>
        );
    }
}
