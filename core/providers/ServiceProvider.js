import RouteServiceProvider from "./RouteServiceProvider";

class ServiceProvider extends RouteServiceProvider{
    constructor(application) {
        super(application);
    }
    
    boot() {
        this.mapRoutes();

        this.register();
    }

    register() {}
}


export default ServiceProvider;