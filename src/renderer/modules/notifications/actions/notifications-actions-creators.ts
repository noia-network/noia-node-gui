import { Dispatcher } from "simplr-flux";
import { Notification } from "react-notification-system";

import { AddNotificationAction, RemoveNotificationAction } from "./notifications-actions";

type Level = "error" | "warning" | "info" | "success";

export namespace NotificationsActionsCreators {
    export function addNotification(notification: Notification & { level: Level }): void {
        Dispatcher.dispatch(new AddNotificationAction(notification));
    }

    export function removeNotification(id: string): void {
        Dispatcher.dispatch(new RemoveNotificationAction(id));
    }
}
