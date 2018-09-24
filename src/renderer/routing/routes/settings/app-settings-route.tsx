import * as React from "react";

import { SettingsAppView } from "@renderer/modules/settings-route/settings-route-module";
import { SettingsContainer } from "@renderer/modules/node-settings/node-settings-module";

export class AppSettingsRoute extends React.Component {
    public render(): JSX.Element {
        return <SettingsContainer>{settings => <SettingsAppView settings={settings} />}</SettingsContainer>;
    }
}
