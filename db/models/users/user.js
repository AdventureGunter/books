/**
 * Created by User on 13.06.2017.
 */
const mongoose = require('../../config');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    passwordHash : {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    }
}, {timestamps : true});

let User = mongoose.model('User', userSchema);

module.exports = User;