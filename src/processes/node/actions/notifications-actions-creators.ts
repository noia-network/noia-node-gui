import { NodeDispatcher } from "../node-dispatcher";
import { CreateNotificationAction, RemoveNotificationAction, AppNotification } from "../../../contracts/notification-actions";

export namespace NotificationActionsCreators {
    export function createNotification(notification: AppNotification): void {
        NodeDispatcher.dispatch<CreateNotificationAction>({
            type: "CREATE_NOTIFICATION",
            notification: notification
        });
    }

    export function removeNotification(uid: string): void {
        NodeDispatcher.dispatch<RemoveNotificationAction>({
            type: "REMOVE_NOTIFICATION",
            uid: uid
        });
    }
}
