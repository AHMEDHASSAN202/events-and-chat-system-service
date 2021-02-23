import { Message } from '../classes/Message';
import { getAppBySecretKeyAndDomainWithSender, getUserTokenById } from './../db/WsModel';
import { getGroupUsers } from './../events/OnMessageEvent';

export const UploadChatImages = async (application, req, res) => {
    let images = req.files;
    let appSecretKey = req.headers['x-app-secret-key'];
    let appDomain = req.headers.origin;
    let senderToken = req.body.senderToken;
    let receiverId = req.body.receiverId;
    let groupId = req.body.groupId;

    //app validation
    if (!senderToken || !appSecretKey || !appDomain) {
        return res.status(401).json({error: 'not authorized'});
    }

    if (!receiverId && !groupId) {
        return res.status(401).json({error: 'something error'});
    }

    //images validation
    let validImages = true;
    Object.keys(images).forEach(file_name => {
        let file = images[file_name];
        if (!file.name.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            validImages = false;
        }
    });

    if (!validImages) {
        return res.status(400).json({error: 'invaild file'});
    }

    let result = await getAppBySecretKeyAndDomainWithSender(appSecretKey, appDomain, senderToken);

    if (!result || result.length < 1) {
        return res.status(401).json({error: 'not authorized'});
    }

    let app = result[0];

    let senderId = app.user_id;

    let sendToUsers = [];

    if (receiverId) {
    
        let receiver = await getUserTokenById(app.app_id, receiverId);
        
        if (!receiver || receiver.length < 1 || !receiver[0].user_token) {
            return res.status(401).json({error: 'receiver not found'});
        }

        sendToUsers.push(senderToken, receiver[0].user_token);

    }else if (groupId) {

        sendToUsers = await getGroupUsers(app.app_id, groupId);

    }


    let message = new Message(images, groupId, senderId, receiverId, 'image');

    message.send(application.io, app.app_token, sendToUsers);

    res.status(200).end();
}