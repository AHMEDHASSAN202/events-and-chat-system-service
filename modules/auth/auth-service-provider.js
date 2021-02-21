import ServiceProvider from "../../core/providers/ServiceProvider";
import AuthAdminRoutes from "./routes/site";

class AuthServiceProviders extends ServiceProvider {
    routes = [
        AuthAdminRoutes
    ];
}

export default AuthServiceProviders; 