import Hooks from "../../core/Hooks";
import ServiceProvider from "../../core/providers/ServiceProvider";
import { getApps } from "./db/WsModel";
import {WsEvents} from './events/index';
import WsRoutes from "./routes/site";
import io, { Socket } from 'socket.io';

class WsServiceProviders extends ServiceProvider {
    routes = [
        WsRoutes
    ];

    async register() {
        //get my apps
        const apps = await getApps(this.application.db);

        //create io server
        this.application.io = io(this.application.httpServer, {
            cors: {
                methods: ["GET", "POST"]
            },
            allowRequest: (req, callback) => {
                callback(null, this.appExists(apps, req.headers.origin, req.headers['x-app-secret-key']) ? true : false); // cross-origin requests will not be allowed
            }
        });

        //set ws all events
        WsEvents();
        
        //set namespace for apps
        apps.map((app) => {
            //fire io.onConnection event when connection
            this.application.io.of(app.app_token).on('connection', socket => {
                socket.appId = app.app_id;
                Hooks.do_action('io.onConnection', this.application, socket);
            });
        });
    }
    
    appExists = (apps, domain, appSecretKey) => {
        if (!appSecretKey || !domain) return false;
        let app = apps.find((a) => a.app_secret_key === appSecretKey && a.app_domain === domain);
        return app ? app : false;
    }


}

export default WsServiceProviders; 