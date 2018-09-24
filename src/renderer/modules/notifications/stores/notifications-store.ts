import { ReduceStore } from "simplr-flux";
import * as Immutable from "immutable";
import { Notification } from "react-notification-system";

import {
    CreateNotificationAction as CreateAppNotificationAction,
    RemoveNotificationAction as RemoveAppNotificationAction
} from "@global/contracts/notification-actions";

import { AddNotificationAction, RemoveNotificationAction } from "../actions/notifications-actions";
import { NotificationsActionsCreators } from "../actions/notifications-actions-creators";

interface State {
    notifications: Immutable.Map<string, Notification>;
}

class NotificationStoreClass extends ReduceStore<State> {
    constructor() {
        super();

        this.registerAction(AddNotificationAction, this.onAdd);
        this.registerAction(RemoveNotificationAction, this.onRemove);

        this.registerFluxAction<CreateAppNotificationAction>("CREATE_NOTIFICATION", this.onAddAppNotification);
        this.registerFluxAction<RemoveAppNotificationAction>("REMOVE_NOTIFICATION", this.onRemoveAppNotification);
    }

    private uniqueIdCounter: number = 0;

    private getNextId(): string {
        return `notification-${this.uniqueIdCounter++}`;
    }

    public getInitialState(): State {
        return {
            notifications: Immutable.Map()
        };
    }

    private addNotification($notification: Notification): Notification & { uid: string } {
        const autoDismiss = $notification.autoDismiss != null ? $notification.autoDismiss : 5;
        const id: string = $notification.uid != null ? $notification.uid.toString() : this.getNextId();

        const notification: Notification = {
            ...$notification,
            autoDismiss: 0,
            uid: id
        };

        notification.onRemove = () => {
            NotificationsActionsCreators.removeNotification(id);

            if ($notification.onRemove != null) {
                $notification.onRemove(notification);
            }
        };

        if (autoDismiss !== 0) {
            setTimeout(() => {
                NotificationsActionsCreators.removeNotification(id);
            }, autoDismiss * 1000);
        }

        return notification as Notification & { uid: string };
    }

    private onAdd = (action: AddNotificationAction, state: State): State => {
        const notification = this.addNotification(action.notification);

        return {
            notifications: state.notifications.set(notification.uid, notification)
        };
    };

    private onRemove = (action: RemoveNotificationAction, state: State): State => {
        if (!state.notifications.has(action.id)) {
            return state;
        }

        return {
            notifications: state.notifications.remove(action.id)
        };
    };

    private onAddAppNotification = (action: CreateAppNotificationAction, state: State): State => {
        const notification = this.addNotification(action.notification);

        return {
            notifications: state.notifications.set(notification.uid, notification)
        };
    };

    private onRemoveAppNotification = (action: RemoveAppNotificationAction, state: State): State => {
        if (!state.notifications.has(action.uid)) {
            return state;
        }

        return {
            notifications: state.notifications.remove(action.uid)
        };
    };
}

export const NotificationStore = new NotificationStoreClass();
