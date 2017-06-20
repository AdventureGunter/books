/**
 * Created by User on 13.06.2017.
 */
const app = require('../app.js');
const http = require('http');
const md5 = require('md5');


const mongoose = require('../db/config');
const config = require('../config');
const User = require('../db/models/users/user');

/**
 * Get port from environment and store in Express.
 */

const port = process.env.PORT || 3000;
app.set('port', port);

const server = http.createServer(app);

mongoose.connect(config.mongoose.url)
    .then(
        () => {
            console.log('Successfully connected to database');
        },
        err => {
            throw err;
        }
    )
    .then(() => {
        return mongoose.connection.db.dropDatabase();
    })
    .then(() => {
        console.log('DB droped');
        let userObj = {
            email: 'vvovvrulit@gmail.com',
            passwordHash : md5('lalala'),
            firstName: 'Stanislav',
            lastName: 'Temchenko'
        };
        return User.findOneAndUpdate({email: userObj.email}, userObj, {upsert : true})
            .then(() => console.log("CREATER - " + JSON.stringify(userObj)))
    })
    .then(() => {
        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);
    })
    .catch(err => {
        console.log(err);
        process.exit();
    });

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}
