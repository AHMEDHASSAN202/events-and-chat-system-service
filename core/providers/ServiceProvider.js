import RouteServiceProvider from "./RouteServiceProvider";

class ServiceProvider extends RouteServiceProvider{
    constructor(application) {
        super(application);
    }
    
    boot() {
        this.register();
        
        this.mapRoutes();
    }

    register() {}
}


export default ServiceProvider;