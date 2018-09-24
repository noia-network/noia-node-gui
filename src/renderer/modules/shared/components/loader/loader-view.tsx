import * as React from "react";
import * as classNames from "classnames";

import "./loader-view.scss";

interface Props {
    className?: string;
    containerClassName?: string;
    color?: "blue";
    /**
     * Expands width and height. Good for single page loader.
     */
    containerFull?: boolean;
}

export class LoaderView extends React.Component<Props> {
    public render(): JSX.Element {
        return (
            <div className={classNames("loader-view", this.props.containerClassName, { full: this.props.containerFull })}>
                <div className={classNames("loader", this.props.className, this.props.color)} />
            </div>
        );
    }
}
