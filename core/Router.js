import middleware from "../config/middleware";

class Router {

    constructor() {
        this.middlewares = [];
        this.routeMiddlewares = middleware.routes;
        this.globalMiddleware = middleware.globals;
    }

    setExpressApp(express) {
        //express app object
        this.express = express;
    }

    runGlobalMiddlewares() {
        let middlewares = this.globalMiddleware || [];
        middlewares.map(middlewareFunction => {
            this.express.use(middlewareFunction);
        })
    }

    _requestMethod(action, route, callback, middlewares = []) {
        //sanitaize route url
        let url = this._url(route);
        //call express action method depending action
        this.express[action](url, [...this.middlewares, ...middlewares, callback]);
        //set empty value
        this.middlewares = [];
    }

    _url(route) {
        route = route.trim();        
        if (!route.startsWith('/')) return '/' + route;
        return route;
    }

    /**
     * GET Route
     * 
     * @param {Router} route 
     * @param {Function} callback 
     */
    get(route, callback) {
        return this._requestMethod('get', route, callback);
    }

    /**
     * POST Route
     * 
     * @param {Router} route 
     * @param {Function} callback  
     */
    post(route, callback) {
        return this._requestMethod('post', route, callback);
    }

    /**
    * PUT Route
    * 
    * @param {Router} route 
    * @param {Function} callback
    */
    put(route, callback) {
        return this._requestMethod('put', route, callback);
    }

    /**
    * PATCH Route
    * 
    * @param {Router} route 
    * @param {Function} callback
    */
    patch(route, callback) {
        return this._requestMethod('patch', route, callback);
    }

    /**
    * DELETE Route
    * 
    * @param {Router} route 
    * @param {Function} callback
    */
    delete(route, callback) {
        return this._requestMethod('delete', route, callback);
    }

    /**
    * OPTIONS Route
    * 
    * @param {Router} route 
    * @param {Function} callback
    */
    options(route, callback) {
        return this._requestMethod('options', route, callback);
    }

    resource(route, actions, routeMiddlewareNames = []) {
        let middlewares = this.getMiddlewares(routeMiddlewareNames);
        this._requestMethod('get', route, actions.List, middlewares);
        this._requestMethod('get', route + '/:id', actions.Show, middlewares);
        this._requestMethod('post', route , actions.Store, middlewares);
        this._requestMethod('put', route + '/:id', actions.Update, middlewares);
        this._requestMethod('delete', route + '/:id', actions.Delete, middlewares);   
    }

    middleware(routeMiddlewareNames = []) {
        if (routeMiddlewareNames) {
            this.middlewares = this.getMiddlewares(routeMiddlewareNames);
        }
        return this;
    }

    getMiddlewares(routeMiddlewareNames = []) {
        return routeMiddlewareNames.map(middlewareName => {
            if (typeof middlewareName == 'function') {
                return middlewareName;
            }
            return this.routeMiddlewares[middlewareName]
        });
    }
}


export default new Router;