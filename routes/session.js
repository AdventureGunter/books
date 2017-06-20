/**
 * Created by User on 13.06.2017.
 */
const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../db/models/users/user');
const UserSession = require('../db/models/users/user_session');

router.post('/', checkAttempts, function(req, res, next) {
    passport.authenticate('local', function(err, token, info) {
        if (err) { return next(err); }
        if(!token) return res.send(info.message);
        return setTimeout(function () {
            return res.json(token);
        }, 3000);

    })(req, res, next);
});

function checkAttempts (req, res ,next) {
    console.log("checkAttempts");
    return User.findOne({email: req.body.email})
        .then(user => {
            if (!user) return next();
            return UserSession.findOne({userId: user._id})
                .then((session) => {
                    let timeCheck = new Date(Date.now() - 5*60000);
                    if (!session) return next();
                    session.attempts = session.attempts.filter(elem => {
                        return elem >= timeCheck
                    });
                    session.save()
                        .then(newSession => {
                            if (newSession.attempts.length >= 3) {
                                return res.status(429).send('Too Many Requests');
                            }
                            else return next();
                        })
                })
        });
}

router.use((req, res, next) => {
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    if(!token) {
        res.send('Unauthorized')
    }
    else {
        return UserSession.findOne({tokenHash: token})
            .then((session) => {
                if(!session) return res.send('Wrong token');
                if (session.expiresAt <= Date.now()) {
                    return logout(req, res, next);
                }
                else return next();
            })
    }
});

router.get('/', (req, res, next) => {
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    return UserSession.findOne({tokenHash: token})
        .then(session => {
            return User.findById(session.userId)
                .then(user => {
                    res.json(user);
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))

});


router.delete('/', logout);

function logout (req, res,next) {
    console.log('LOGOUT');
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    return UserSession.remove({tokenHash: token})
        .then(() => {
            res.send('Session closed'); //Inside a callback… bulletproof!
        });
}
module.exports = router;