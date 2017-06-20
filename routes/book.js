/**
 * Created by User on 13.06.2017.
 */
const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const iconv = require ('iconv-lite');
const RateLimit = require('express-rate-limit');
const Queue = require('simple-redis-safe-work-queue');

const bookParser = require('../parser/parser');
const Book = require('../db/models/book/book');
const BookSearch = require('../classes/bookSearch');
const searcher = new BookSearch ();

const createAccountLimiter = new RateLimit({
    windowMs: 60000,
    delayAfter: 1,
    delayMs: 3*1000,
    max: 2,
    message: "Too Many Requests"
});

router.post('/', (req, res, next) => {

});

router.get('/:ISBN', createAccountLimiter,(req, res, next) => {
    searcher.search(req.params.ISBN)
        .then((book) => {
            if (book.status === 202) {
                res.status(202);
                res.end();
            }
            else res.json(book).status(200);
        })
        .catch(err => next(err));
});

router.delete('/', (req, res, next) => {

});

function getBook (req, res, next) {
    return Book.findOne({ISBN: req.params.ISBN})
        .then(book => {
            if (!book) {
                res.status(202);
                res.end();
                return Book.create({ISBN: req.params.ISBN, isReady: false , requestedAt: Date.now()})
                    .then(() => bookParser.parse(req.params.ISBN))
                    .then((book) => {
                        console.log('Book parsed');
                        book.ISBN = req.params.ISBN;
                        book.isReady = true;
                        return Book.findOneAndUpdate({ISBN: book.ISBN}, book, {'new': true, upsert : true, returnNewDocument : true})
                            .then(() => console.log('Book done'));
                    })
                    .catch(err => {
                        throw err;
                    })
            }
            else {
                if (book.requestedAt > new Date(Date.now() - 30000) && book.isReady === false) {
                    console.log('REQUESTED lalala');
                    Book.findOneAndUpdate({ISBN: req.params.ISBN}, {requestedAt: Date.now()})
                        .then(() => getBook(req, res, next));
                }
                else if (book.requestedAt < new Date(Date.now() - 30000) && book.isReady === false){
                    res.status(202);
                    res.end();
                }
                else {
                    if (book.requestedAt < new Date(Date.now() - 15*60000)) {
                        return getBook(req, res, next);
                    }
                    else res.json(book);
                }
            }
        })
        .catch(err => console.log(err))
}

module.exports = router;