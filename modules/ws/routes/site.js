import { UploadChatImages } from "../actions/UploadChatImages";

export default function WsRoutes(app) {
    app.router.post('chat/files/uploads', (req, res) => {
        UploadChatImages(app, req, res);
    });
}