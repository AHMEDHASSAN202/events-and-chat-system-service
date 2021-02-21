import { getGroupUsersDB, getUserByToken } from "../db/WsModel";

const users = {};

export default async function onConnection(application, socket) {

    //joinedChat event
    socket.on('joinedChat', async (userToken) => {
        let result = await getUserByToken(application.db, userToken, socket.appId);
        
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

    socket.on('message', function(msg, receiverId=null, groupId=null) {
        if (receiverId != null) {
            //message info
            let senderToken = socket.user_token;
            let receiver = users[receiverId];

            
            //validation
            if (!receiver || !senderToken) {
                socket.emit('error', 'receiver not found!');
                return;
            }

            //result data
            let message = new Message(msg, groupId, socket.user_id, receiverId);
            //push to private rooms [sender and recevier] 
            application.io.of(socket.nsp.name)
                            .to(senderToken)
                            .to(receiver.user_token)
                            .emit('message', message);
        }else if (groupId != null) {
            //handle message to group
            getGroupUsers(application.db, socket.appId, groupId).then(groupUsers => {
                let message = new Message(msg, groupId, socket.user_id, receiverId);
                groupUsers.forEach((user) => {
                    application.io.of(socket.nsp.name)
                                  .to(user.user_token)
                                  .emit('message', message);
                });
            })
        }else {
            socket.emit('error', 'receiver or group is required!');
            return;
        }
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

const getGroupUsers = async (db, appId, groupId) => {
    //group users in db
    let groupUsersInDB = await getGroupUsersDB(db, appId, groupId);
    //get online users
    let groupUsersOnline = [];
    groupUsersInDB.forEach((value) => {
        let usr = users[value.fk_user_id];
        if (usr) {
            groupUsersOnline.push(usr);
        }
    });
    return groupUsersOnline;
}

//{senderId: socket.user_id, receiverId: null, groupId: groupId, msg};
class Message {
    constructor(msg, groupId, senderId, receiverId) {
        this.msg = msg;
        this.groupId = groupId;
        this.senderId = senderId;
        this.receiverId = receiverId;
    }
}