import { EventEmit } from "../actions/EventEmit";
import { NotificationAction } from "../actions/Notification";
import { UploadChatImages } from "../actions/UploadChatImages";

export default function WsRoutes(app) {
    app.router.post('ws/chat/files/uploads', (req, res) => {
        UploadChatImages(app, req, res);
    });

    app.router.post('ws/notifications', (req, res) => {
        NotificationAction(app, req, res);
    });

    app.router.post('ws/event/emit', (req, res) => {
        EventEmit(app, req, res);
    });
}