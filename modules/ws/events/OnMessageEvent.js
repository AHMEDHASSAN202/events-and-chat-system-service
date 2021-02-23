import { Message } from "../classes/Message";
import { getGroupUsersDB } from "../db/WsModel";
import { APPS } from "./../Constants";

export default function onMessageEvent(application, socket) {
    socket.on('message', async function(message_content, receiverId=null, groupId=null, message_type='text') {
        let sendToUsers = [];
        let senderToken = socket.user_token;

        //validation
        if (!((senderToken && receiverId) || (senderToken && groupId))) {
            socket.emit('error', 'something error');
            return;
        }

        if (receiverId != null) {
            //handle private message
            sendToUsers = [senderToken];
            //if receiver user is online
            let usr = APPS[socket.appId].users[receiverId];
            if (usr) {
                sendToUsers.push(usr.user_token);
            }
            
        }else if (groupId != null) {
            //handle message to group
            sendToUsers = await getGroupUsers(socket.appId, groupId);
        }

        let message = new Message(message_content, groupId, socket.user_id, receiverId, message_type);

        message.send(application.io, socket.nsp.name, sendToUsers);
    });
};


export const getGroupUsers = async (appId, groupId) => {
    //group users in db
    let groupUsersInDB = await getGroupUsersDB(appId, groupId);
    //get online users
    let groupUsersOnlineTokens = [];
    groupUsersInDB.forEach((value) => {
        let usr = APPS[appId].users[value.fk_user_id];
        if (usr) {
            groupUsersOnlineTokens.push(usr.user_token);
        }
    });
    return groupUsersOnlineTokens;
}