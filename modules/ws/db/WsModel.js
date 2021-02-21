export const getApps = (db) => {
    return db.query('SELECT * FROM apps WHERE app_status=1');
} 

export const getUserByToken = (db, userToken, appId) => {
    return db.query('SELECT * FROM users WHERE user_token=? AND user_fk_app_id=? LIMIT 1', [userToken, appId]);
}

export const getGroupUsersDB = (db, appId, groupId) => {
    let query = `
        SELECT rooms.*, room_user.* FROM rooms
        INNER JOIN room_user ON rooms.room_id = room_user.fk_room_id
        WHERE rooms.room_fk_app_id=? AND rooms.room_id=?
    `;

    return db.query(query, [appId, groupId]);
}