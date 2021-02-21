import mysql from 'mysql';

class DB {
    constructor () {
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        })
    }

    connect() {
        this.connection.connect(err => {
            if (err) {
                console.log('Error Connection to Mysql DB');
            }
        })
    }

    end() {
        this.connection.end();
    }


    query(sql, value = []) {
        try {
            return new Promise((resolve, reject) => {
                this.connection.query(sql, value, (err, result) => {
                    if (err) {
                        reject(err);
                    }else {
                        resolve(result);
                    }
                });
            })
        }catch(err) {
            return err;
        }
    }
}  

export default DB;