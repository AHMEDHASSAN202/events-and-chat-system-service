import { getApp } from '../Constants';

export const EventEmit = async (application, req, res) => {
    let appSecretKey = req.headers['x-app-secret-key'];
    let appDomain = req.headers.origin;
    let event = req.body.event; //array of user_id
    let data = req.body.data;

    //app validation
    if (!appSecretKey || !appDomain) {
        return res.status(401).json({error: 'not authorized'});
    }

    if (!event) {
        return res.status(401).json({error: 'event is required'});
    }

    let app = await getApp(appSecretKey, appDomain);

    if (!app) {
        return res.status(401).json({error: 'not authorized'});
    }
    
    let eventName = 'event.' + event;

    application.io.of(app.app_token).emit(eventName, data);

    res.status(200).end();
}