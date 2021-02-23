import { saveMessageDB } from "../db/WsModel";
import { MessageContent } from "./MessageContent";

export class Message {
    constructor(message_content, groupId, senderId, receiverId, type='text') {
        this.message = new MessageContent(message_content, groupId, senderId, receiverId, type);
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
    send(io, socket_nsp, sendToUsers) {
        if (!sendToUsers || sendToUsers.length == 0) return;
        this.saveMessage().then((result) => {
            sendToUsers.forEach((userToken) => {
                io.of(socket_nsp)
                  .to(userToken)
                  .emit('message', this.message);
            })
        }).catch((e) => {
            socket.emit('error', 'something error');
        })
    }
} 