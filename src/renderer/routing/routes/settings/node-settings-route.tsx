import * as React from "react";

import { SettingsNodeView } from "@renderer/modules/settings-route/settings-route-module";
import { SettingsContainer } from "@renderer/modules/node-settings/node-settings-module";

export class NodeSettingsRoute extends React.Component {
    public render(): JSX.Element {
        return <SettingsContainer>{settings => <SettingsNodeView settings={settings} />}</SettingsContainer>;
    }
}
