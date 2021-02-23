import Application from "../../../core/Application";

export const getApps = () => {
    return Application.dbConnection().query('SELECT * FROM apps WHERE app_status=1');
} 

export const getAppBySecretKeyAndDomainWithSender = (app_secret_key, app_domain, senderToken) => {
    let query = `
        SELECT app_id, app_secret_key, app_domain, app_token, user_id, user_token  
        FROM apps 
        INNER JOIN users ON app_id = user_fk_app_id 
        WHERE app_secret_key=? AND app_domain=? AND app_status=1 AND user_token=?
    `;
    return Application.dbConnection().query(query, [app_secret_key, app_domain, senderToken]);
} 


export const getUserByToken = (userToken, appId) => {
    return Application.dbConnection().query('SELECT * FROM users WHERE user_token=? AND user_fk_app_id=? LIMIT 1', [userToken, appId]);
}

export const getGroupUsersDB = (appId, groupId, select = 'rooms.*, room_user.*') => {
    let query = `
        SELECT ${select} FROM rooms
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

export const getUserTokenById = (app_id, user_id) => {
    let query = `
        SELECT user_token 
        FROM users 
        WHERE user_fk_app_id=? 
        AND 
        user_id=?
        LIMIT 1
    `;

    return Application.dbConnection().query(
            query, 
           [ app_id, user_id]
        );
}
