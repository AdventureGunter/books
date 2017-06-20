/**
 * Created by User on 13.06.2017.
 */
const BearerStrategy  = require('passport-http-bearer').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const md5 = require('md5');


const User = require('../db/models/users/user');
const UserSession = require('../db/models/users/user_session');

module.exports = function(passport) {

    /*passport.serializeUser(function (token, done) {
        return setTimeout(function () {
            console.log('serializeUser');
            console.log(token);
            done(null, token);
        }, 3000);
    });

    passport.deserializeUser(function (token, done) {
        console.log('deserializeUser');
        return UserSession.findOne({tokenHash : token})
            .then(session => User.findById(session.userId))
            .then((user) => {
                console.log(token);
                return done(null, user)
            })
            .catch(err => done(err))
    });*/

    passport.use('local', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, username, password, done) => {
            User.findOne({email: username})
                .then(user => {
                        if (!user) {
                            console.log('Incorrect username');
                            return done(null, false, { message: 'Incorrect username.' });
                        }
                        if (user.passwordHash !== md5(password)) {
                            console.log("Incorrect password");
                            return UserSession.findOneAndUpdate({userId: user._id}, {userId: user._id}, {'new': true, upsert : true, returnNewDocument : true})
                                .then(() => {
                                    return done(null, false, { message: 'Incorrect password.' });
                                });
                        }
                        console.log('Success logined!!!!!!');
                        let sessionObj = {
                            userId: user._id,
                            tokenHash : md5(user._id + Date.now()),
                            loggedInAt : Date.now(),
                            expiresAt: new Date(Date.now() + 10*60000)
                        };

                        return UserSession.findOneAndUpdate({userId: user._id}, sessionObj, {'new': true, upsert : true, returnNewDocument : true})
                            .then((session) => {
                                console.log('Session created');
                                return done(null, session.tokenHash);
                            })
                    }
                )
                .catch(err => done(err));
        }
    ));

    /*passport.use('bearer', new BearerStrategy(
     (accessToken, done) => {
     User.findOne({ token: accessToken }, (err, user) => {
     if (err) { return done(err); }
     if (!user) { return done(null, false); }
     return done(null, user, { scope: 'all' });
     });
     }
     ));*/
};