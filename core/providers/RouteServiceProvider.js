export default class RouteServiceProvider {
    routes = [];

    constructor (application) {
        this.application = application;
    }

    /**
     * 
     * map on routes in service provider adn call value [function]
     * 
     * @param {*} router 
     */
    mapRoutes() {
        if (!this.routes) return;
        for (let routeFunction of this.routes) {
            //call route file function
            routeFunction(this.application);
        }
    }


}