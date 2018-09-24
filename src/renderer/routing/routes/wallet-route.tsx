import * as React from "react";

import { WalletRouteView } from "@renderer/modules/wallet-route/wallet-route-module";
import { SettingsContainer } from "@renderer/modules/node-settings/node-settings-module";

export class WalletRoute extends React.Component {
    public render(): JSX.Element {
        return <SettingsContainer>{settings => <WalletRouteView settings={settings} />}</SettingsContainer>;
    }
}
