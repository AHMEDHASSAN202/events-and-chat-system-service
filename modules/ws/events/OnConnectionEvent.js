import { getGroupUsersDB, getUserByToken, saveMessageDB } from "../db/WsModel";

const users = {};

export default async function onConnection(application, socket) {

    //joinedChat event
    socket.on('joinedChat', async (userToken) => {
        let result = await getUserByToken(userToken, socket.appId);
        
        if (!result || !result.length) {
            socket.emit('error', 'something error!');
            return;
        }
        
        let user = result[0];
        //add user info to socket object
        socket.user_id = user.user_id;
        socket.user_token = user.user_token;
        //add socket to current user
        user.socket = socket;
        //set current user to users array
        users[user.user_id] = user;
        
        //push new array (onlineUsers) to users
        emitOnlineUsers();

        //create private room
        socket.join(userToken);
    });

    //leave chat event
    socket.on('leavejoinedChat', () => {
        //remove current user from users array
        removeUserFromOnlineUsers(socket.user_token);
        
        //push new array (onlineUsers) to users
        emitOnlineUsers();
        //leave private room for user
        socket.leave(socket.user_token);
    })

    socket.on('message', async function(message_content, receiverId=null, groupId=null) {
        
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
            let usr = users[receiverId];
            if (usr) {
                sendToUsers.push(usr.user_token);
            }
            
        }else if (groupId != null) {
            //handle message to group
            sendToUsers = await getGroupUsers(socket.appId, groupId);
        }

        let message = new Message(message_content, groupId, socket.user_id, receiverId);

        message.send(application.io, socket, sendToUsers);
    });
}


const removeUserFromOnlineUsers = (userToken) => {
    if (!userToken) return false;
    Object.keys(users).forEach((key) => {
        if (users[key].user_token == userToken) {
            delete users[key];
            return;
        }
    })
}

const getOnlineUsers = () => {
    let onlineUsers = [];
    Object.keys(users).forEach((key) => onlineUsers.push({userId: users[key].user_id}));
    return onlineUsers;
}

const emitOnlineUsers = () => {
    let onlineUsers = getOnlineUsers();
    Object.keys(users).forEach((key) => {
        users[key].socket.emit('onlineUsers', {onlineUsers});
    });
} 

const getGroupUsers = async (appId, groupId) => {
    //group users in db
    let groupUsersInDB = await getGroupUsersDB(appId, groupId);
    //get online users
    let groupUsersOnlineTokens = [];
    groupUsersInDB.forEach((value) => {
        let usr = users[value.fk_user_id];
        if (usr) {
            groupUsersOnlineTokens.push(usr.user_token);
        }
    });
    return groupUsersOnlineTokens;
}

//{senderId: socket.user_id, receiverId: null, groupId: groupId, msg};
class Message {
    constructor(message_content, groupId, senderId, receiverId) {
        this.message = new MessageContent(message_content, groupId, senderId, receiverId);
    }

    //save message to db
    saveMessage() {
        return saveMessageDB(
            this.message.senderId, 
            this.message.receiverId,
            this.message.groupId, 
            this.message.message_content, 
            this.message.type
        );
    }

    //send message to users
    send(io, socket, sendToUsers) {
        if (!sendToUsers || sendToUsers.length == 0) return;
        this.saveMessage().then((result) => {
            sendToUsers.forEach((userToken) => {
                io.of(socket.nsp.name)
                  .to(userToken)
                  .emit('message', this.message);
            })
        }).catch((e) => {
            socket.emit('error', 'something error');
        })
    }
}

class MessageContent {
    constructor(message_content, groupId, senderId, receiverId) {
        this.message_type = 'text';
        this.message_content = '';
        this.groupId = groupId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.read_at = null;
        this.created_at = null;
        this.handleMessage(message_content);
    }

    //handle message
    handleMessage(msg) {
        switch(typeof msg) {
            case 'string': 
                this.message_type = 'text';
                this.message_content  = msg;
                break;
            case 'file': 
                let file = this.handleFile(msg);
                this.message_type = file.type;
                this.message_content  = file.path;    
                break;
        }
    }

    //handle file
    handleFile(file) {
        return null;
    }
}