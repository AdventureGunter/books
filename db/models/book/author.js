/**
 * Created by User on 14.06.2017.
 */
const mongoose = require('../../config');
const Schema = mongoose.Schema;

const authorSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
}, {timestamps : true});

let Author = mongoose.model('Author', authorSchema);

module.exports = Author;