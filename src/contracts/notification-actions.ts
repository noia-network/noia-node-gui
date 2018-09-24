import { AppAction } from "./dispatcher";

export interface AppNotification {
    uid?: string;
    level: "error" | "warning" | "info" | "success";
    title?: string;
    message: string;
    autoDismiss?: number;
}

export interface CreateNotificationAction extends AppAction {
    type: "CREATE_NOTIFICATION";
    notification: AppNotification;
}

export interface RemoveNotificationAction extends AppAction {
    type: "REMOVE_NOTIFICATION";
    uid: string;
}
