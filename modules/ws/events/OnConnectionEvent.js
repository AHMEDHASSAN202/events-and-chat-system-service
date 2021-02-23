import { getUserByToken } from "../db/WsModel";
import { APPS } from "./../Constants";

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
        APPS[socket.appId].users[user.user_id] = user;
        
        //push new array (onlineUsers) to users
        emitOnlineUsers(socket.appId);

        //create private room
        socket.join(userToken);
    });

    //leave chat event
    socket.on('leavejoinedChat', () => {
        //remove current user from users array
        removeUserFromOnlineUsers(socket.appId, socket.user_token);
        
        //push new array (onlineUsers) to users
        emitOnlineUsers(socket.appId);
        //leave private room for user
        socket.leave(socket.user_token);
    })
}


const removeUserFromOnlineUsers = (app_id, userToken) => {
    if (!userToken) return false;
    Object.keys(APPS[app_id].users).forEach((key) => {
        if (APPS[app_id].users[key].user_token == userToken) {
            delete APPS[app_id].users[key];
            return;
        }
    })
}

const getOnlineUsers = (app_id) => {
    let onlineUsers = [];
    let users = APPS[app_id].users;
    Object.keys(users).forEach((key) => onlineUsers.push({userId: users[key].user_id}));
    return onlineUsers;
}

const emitOnlineUsers = (app_id) => {
    let onlineUsers = getOnlineUsers(app_id);
    let users = APPS[app_id].users;
    Object.keys(users).forEach((key) => {
        users[key].socket.emit('onlineUsers', {onlineUsers});
    });
} 
