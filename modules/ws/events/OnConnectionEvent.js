import { getUserByToken } from "../db/WsModel";
import { users } from "./../Constants";

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
