import { MainDispatcher } from "./main-dispatcher";
import { CreateNotificationAction, RemoveNotificationAction, AppNotification } from "../contracts/notification-actions";

export namespace NotificationActionsCreators {
    export function createNotification(notification: AppNotification): void {
        MainDispatcher.dispatch<CreateNotificationAction>({
            type: "CREATE_NOTIFICATION",
            notification: notification
        });
    }

    export function removeNotification(uid: string): void {
        MainDispatcher.dispatch<RemoveNotificationAction>({
            type: "REMOVE_NOTIFICATION",
            uid: uid
        });
    }
}
