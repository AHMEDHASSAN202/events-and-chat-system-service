import Application from "../../../core/Application";

export const getApps = () => {
    return Application.dbConnection().query('SELECT * FROM apps WHERE app_status=1');
} 

export const getUserByToken = (userToken, appId) => {
    return Application.dbConnection().query('SELECT * FROM users WHERE user_token=? AND user_fk_app_id=? LIMIT 1', [userToken, appId]);
}

export const getGroupUsersDB = (appId, groupId) => {
    let query = `
        SELECT rooms.*, room_user.* FROM rooms
        INNER JOIN room_user ON rooms.room_id = room_user.fk_room_id
        WHERE rooms.room_fk_app_id=? AND rooms.room_id=?
    `;

    return Application.dbConnection().query(query, [appId, groupId]);
}

export const saveMessageDB = (msg_sender, msg_receiver, msg_group_id, msg_content, msg_type='text') => {
    let query = `
        INSERT INTO messages SET 
        message_sender=?,
        message_receiver=?,
        message_fk_room_id=?,
        message_content=?,
        message_type=?
    `;
    return Application.dbConnection().query(query, [
        msg_sender, msg_receiver, msg_group_id, msg_content, msg_type
    ]);
}