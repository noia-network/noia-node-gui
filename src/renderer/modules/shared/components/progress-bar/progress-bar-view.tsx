import * as React from "react";

import "./progress-bar-view.scss";

interface Props {
    /**
     * From 0% to 100%.
     */
    progress: number;
}

export class ProgressBarView extends React.Component<Props> {
    public render(): JSX.Element {
        let progress: number;
        if (this.props.progress >= 100) {
            progress = 100;
        } else if (this.props.progress <= 0 || isNaN(this.props.progress)) {
            progress = 0;
        } else {
            progress = this.props.progress;
        }

        return (
            <div className="progress-bar-view">
                <div className="progress" style={{ width: `${progress}%` }} />
            </div>
        );
    }
}
