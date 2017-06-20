/**
 * Created by User on 14.06.2017.
 */
const mongoose = require('../../config');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    ISBN: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    title : {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageUrls: [{
        type: String,
    }],
    properties : {
        type: Schema.Types.Mixed,
    },
    authors : [{
        type: Schema.Types.ObjectId,
        ref: 'Author',
    }],
    isReady : {
        type: Boolean,
        trim: true,
        required: true
    },
    requestedAt : {
        type: Date,
        trim: true,
        required: true
    }
}, {timestamps : true});

let Book = mongoose.model('Book', bookSchema);

module.exports = Book;