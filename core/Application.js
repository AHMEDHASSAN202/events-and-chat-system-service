import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import ServiceProviderContainer from '../config/service-provider-container';
import router from './../core/Router';
import DB from './DB';
import express from 'express';
import httpServer from 'http';

class Application {
    
    //initial value for serviceProviders Container Objects
    serviceProviders = [];
    
    //set router object
    router = router;

    constructor() {
        //prepare my server by express
        this.prepareServer();
        //set express app in my framework
        this.router.setExpressApp(this.express);
        //run global middlewares
        this.router.runGlobalMiddlewares(this.express);
        //initial application
        this.init();
    }

    init() {
        //db connect 
        this.dbConnection();

        //load all service providers
        this.loadServiceProviders();
    }

    prepareServer() {
        //register dotenv config
        dotenv.config();
        //set express app
        this.express = express();
        //create http server
        this.httpServer = httpServer.createServer(this.express);
        //cors middleware
        this.express.use(cors());
        //bodyParser middleware for body params
        this.express.use(bodyParser.urlencoded({extended: true}));
        //fileupload middleware
        this.express.use(fileUpload({ 
            useTempFiles : true,
            tempFileDir : '/../tmp/'
        }));
        //share app
        this.express.use((req, res, next) => {
            req.app = this;
            next();
        });
    }

    run() {
        //listen http server
        this.httpServer.listen(3000, function () {
            console.log(`Server is runing on port 3000`);
        });
    }

    dbConnection() {
        //db connection
        this.db = new DB();
        this.db.connect();
    }

     /**
      * Load Service Providers
      * create object from service provider and 
      * register it in serviceProviders array
      * 
      * @return void
      */
    loadServiceProviders() {
        for(let i = 0; i < ServiceProviderContainer.length; i++) {
            let SP = new ServiceProviderContainer[i](this);
            SP.boot();
            this.serviceProviders.push(SP);
        }
    }

}


export default Application;