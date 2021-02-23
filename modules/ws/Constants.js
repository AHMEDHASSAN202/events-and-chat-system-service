export const APPS = {};

export const getApp = (appSecretKey, appDomain) => {
    let app = null;
    Object.keys(APPS).forEach((key) => {
        let a = APPS[key];
        if (
            a.app_secret_key == appSecretKey && 
            a.app_domain == appDomain && 
            a.app_status == 1
            ) {
                app = a;
                return;
            }
    })
    return app;
}