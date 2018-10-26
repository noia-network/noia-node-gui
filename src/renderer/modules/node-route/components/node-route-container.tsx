import * as React from "react";
import { Container } from "flux/utils";

import { MasterConnectionState } from "@global/contracts/node";
import { SpeedStats, StorageStats, SeedStats } from "@global/contracts/node-actions";
import { LoaderView } from "@renderer/modules/shared/shared-module";

import { NodeStore } from "../stores/node-store";
import { NodeRouteView } from "./node-route-view";

interface State {
    connection: MasterConnectionState | undefined;
    connectionsCount: number;
    speed: SpeedStats;
    storageStats: StorageStats;
    seedStats: SeedStats;
}

class NodeRouteContainerClass extends React.Component<{}, State> {
    public static getStores(): Container.StoresList {
        return [NodeStore];
    }

    public static calculateState(): State {
        const { connectionsCount, connection, speed, storageStats, seedStats } = NodeStore.getState();

        return {
            connectionsCount: connectionsCount.http + connectionsCount.ws + connectionsCount.wrtc,
            connection: connection,
            speed: speed,
            storageStats: storageStats,
            seedStats: seedStats
        };
    }

    public render(): JSX.Element {
        if (this.state.connection == null) {
            return <LoaderView color="blue" containerFull={true} />;
        }

        return (
            <NodeRouteView
                connectionsCount={this.state.connectionsCount}
                speed={this.state.speed}
                storageStats={this.state.storageStats}
                seedStats={this.state.seedStats}
            />
        );
    }
}

export const NodeRouteContainer = Container.create(NodeRouteContainerClass);
