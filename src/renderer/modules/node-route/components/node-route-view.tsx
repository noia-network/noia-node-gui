import * as React from "react";

import { SpeedStats, StorageStats, SeedStats } from "@global/contracts/node-actions";

import { DataView } from "./aside/data/data-view";
import { StorageView } from "./aside/storage/storage-view";
import { StatisticsView } from "./main/statistics/statistics-view";
import { SpeedView } from "./main/speed/speed-view";

import { TimeConnectedContainer } from "./main/time-connected-container";
import { ControlsContainer } from "./main/controls-container";

import "./node-route-view.scss";

interface Props {
    connectionsCount: number;
    speed: SpeedStats;
    storageStats: StorageStats;
    seedStats: SeedStats;
}

export class NodeRouteView extends React.Component<Props> {
    public render(): JSX.Element {
        return (
            <div className="node-route-view">
                <aside>
                    <StorageView usedStorage={this.props.storageStats.used} availableStorage={this.props.storageStats.total} />
                    <DataView value={this.props.storageStats.used} description="Cached data" />
                    <DataView value={this.props.seedStats.totalDownloaded} description="Total data downloaded" />
                    <DataView value={this.props.seedStats.totalUploaded} description="Total data uploaded" />
                </aside>
                <main>
                    <div className="row">
                        <StatisticsView value={this.props.connectionsCount} description="Connections" />
                        <TimeConnectedContainer />
                    </div>
                    <div className="row gauges">
                        <SpeedView speedBps={this.props.speed.download} description="Download speed" />
                        <SpeedView speedBps={this.props.speed.upload} description="Upload speed" />
                    </div>
                    <div className="row">
                        <ControlsContainer />
                    </div>
                </main>
            </div>
        );
    }
}
