/**
 * Created by User on 13.06.2017.
 */
const mongoose = require('../../config');
const Schema = mongoose.Schema;

const user_sessionSchema = new Schema({
    userId: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    tokenHash : {
        type: String,
        unique: true,
        trim: true
    },
    attempts: [{
        type: Date,
        required: true,
        trim: true
    }],
    expiresAt : {
        type: Date,
        trim: true
    },
    loggedInAt : {
        type: Date,
        trim: true
    }
});

user_sessionSchema.pre('findOneAndUpdate', function(next) {
    this.update({},{ $push: {attempts : Date.now()}});
    next();
});



let UserSession = mongoose.model('UserSession', user_sessionSchema);

module.exports = UserSession;