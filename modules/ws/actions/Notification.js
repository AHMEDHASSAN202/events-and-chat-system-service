import { APPS, getApp } from '../Constants';

export const NotificationAction = async (application, req, res) => {
    let appSecretKey = req.headers['x-app-secret-key'];
    let appDomain = req.headers.origin;
    let notifyUsers = req.body.notifyUsers; //array of user_id
    let data = req.body.data;

    //app validation
    if (!appSecretKey || !appDomain) {
        return res.status(401).json({error: 'not authorized'});
    }

    if (!notifyUsers || notifyUsers.length < 1) {
        return res.status(401).json({error: 'users are required'});
    }

    let app = await getApp(appSecretKey, appDomain);

    if (!app) {
        return res.status(401).json({error: 'not authorized'});
    }

    notifyUsers.forEach((user_id) => {
        let usr = APPS[app.app_id].users[user_id];
        if (usr) {
            application.io.of(app.app_token).to(usr.user_token).emit('notification', data);
        }
    });

    res.status(200).end();
}