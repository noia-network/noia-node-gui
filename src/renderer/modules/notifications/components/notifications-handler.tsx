import * as React from "react";
import { Container } from "flux/utils";
import * as NotificationSystem from "react-notification-system";
import * as Immutable from "immutable";

import { NotificationStore } from "../stores/notifications-store";

interface State {
    notifications: Immutable.Map<string, NotificationSystem.Notification>;
}

export class NotificationsHandlerClass extends React.Component<{}, State> {
    public state: State = {
        notifications: Immutable.Map()
    };

    private notificationSystem: NotificationSystem.System | null = null;

    public static getStores(): Container.StoresList {
        return [NotificationStore];
    }

    public static calculateState(_: State): State {
        const store = NotificationStore.getState();

        return {
            notifications: store.notifications
        };
    }

    public componentDidUpdate(_: {}, prevState: State): void {
        if (this.notificationSystem == null) {
            return;
        }

        const keys = this.state.notifications.keySeq().toSet();
        const prevKeys = prevState.notifications.keySeq().toSet();

        const allKeys = keys.merge(prevKeys).toArray();

        for (const key of allKeys) {
            const notification = this.state.notifications.get(key);
            const prevNotification = prevState.notifications.get(key);

            if (prevNotification == null && notification != null) {
                // Adding new notification.
                this.notificationSystem.addNotification(notification);
            } else if (prevNotification != null && notification == null) {
                // Removing old notification. (UID is present from store)
                this.notificationSystem.removeNotification(prevNotification.uid!);
            } else if (prevNotification !== notification) {
                this.notificationSystem.editNotification(prevNotification, notification);
            }
        }
    }

    private setRef = (component: NotificationSystem.System | null) => {
        this.notificationSystem = component;
    };

    public render(): JSX.Element {
        return <NotificationSystem ref={this.setRef} />;
    }
}

export const NotificationsHandler = Container.create(NotificationsHandlerClass);
