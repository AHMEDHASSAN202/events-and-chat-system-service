
export class MessageContent {
    constructor(message_content, groupId, senderId, receiverId, type) {
        this.message_type = type;
        this.message_content = this.handleMessage(message_content);
        this.groupId = groupId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.read_at = null;
        this.created_at = null;
    }

    //handle message
    handleMessage(message_content) {
        if (!(this.message_type == 'text' || this.message_type == 'image')) return null;
        //if normal text message
        if (this.message_type == 'text') {
            return message_content;
        }
        //if images
        let images = this.handleFiles(message_content);

        //json encode images data for store in db
        return JSON.stringify(images);
    }

    //handle file
    handleFiles(files) {
        let images = [];
        Object.keys(files).forEach(img_name => {
            let img = files[img_name];
            let path = './uploads/images/' + img.md5 + img_name;
            img.mv(path);
            images.push({img_name, path});
        });

        return images;
    }
}