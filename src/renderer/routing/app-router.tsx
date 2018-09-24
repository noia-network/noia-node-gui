import * as React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { Router } from "react-router";

import { LayoutView } from "@renderer/modules/layout/layout-module";

import { appHistory } from "./app-history";

import { NodeRoute } from "./routes/node-route";
import { WalletRoute } from "./routes/wallet-route";
import { SettingsRoute } from "./routes/settings-route";

export class AppRouter extends React.Component {
    public render(): JSX.Element {
        return (
            <Router history={appHistory}>
                <Route path="/">
                    <LayoutView>
                        <Switch>
                            <Route path="/node" component={NodeRoute} />
                            <Route path="/wallet" component={WalletRoute} />
                            <Route path="/settings" component={SettingsRoute} />
                            <Redirect to="/node" />
                        </Switch>
                    </LayoutView>
                </Route>
            </Router>
        );
    }
}
