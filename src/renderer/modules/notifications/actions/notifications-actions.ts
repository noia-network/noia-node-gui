import { Notification } from "react-notification-system";

export class AddNotificationAction {
    constructor(private _notification: Notification) {}

    public get notification(): Notification {
        return this._notification;
    }
}

export class RemoveNotificationAction {
    constructor(private _id: string) {}

    public get id(): string {
        return this._id;
    }
}
