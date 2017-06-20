/**
 * Created by User on 16.06.2017.
 */
const Book = require('../db/models/book/book');
const Author = require('../db/models/book/author');
const bookParser = require('../parser/parser');

class BookSearch {

    search(ISBN) {
        return Book.findOne({ISBN: ISBN})
            .then(book => {
                if (!book) {
                    let book = {};
                    Book.create({ISBN: ISBN, isReady: false , requestedAt: Date.now()})
                        .then(() => bookParser.parse(ISBN))
                        .then((book) => {
                            if(book.properties['Автор']){
                                return Author.findOneAndUpdate({name: book.properties['Автор']}, {name: book.properties['Автор']}, {'new': true, upsert : true, returnNewDocument : true})
                                    .then(author => {
                                        book.authors = [author._id];
                                        return book;
                                    })
                            }
                            if(book.properties['Авторы']){
                                let promArray = book.properties['Авторы'];
                                promArray.map(elem => {
                                    return  Author.findOneAndUpdate({name: elem}, {name: elem}, {'new': true, upsert : true, returnNewDocument : true})
                                        .then(author => {
                                            return author._id
                                        });
                                });
                                book.authors = Promise.all(promArray);
                                return book;
                            }
                            return book.authors = null;
                        })
                        .then((book) => {
                            console.log('Book parsed');
                            book.ISBN = ISBN;
                            book.isReady = true;
                            return Book.findOneAndUpdate({ISBN: book.ISBN}, book, {'new': true, upsert : true, returnNewDocument : true})
                                .then(() => console.log('Book done'));
                        })
                        .catch(err => {
                            throw err;
                        });
                    book.status = 202;
                    return book;
                }
                else {
                    if (book.requestedAt > new Date(Date.now() - 30000) && book.isReady === false) {
                        Book.findOneAndUpdate({ISBN: ISBN}, {requestedAt: Date.now()})
                            .then(() => search(ISBN));
                    }
                    else if (book.requestedAt < new Date(Date.now() - 30000) && book.isReady === false){
                        book.status = 202;
                        return book;
                    }
                    else {
                        if (book.requestedAt < new Date(Date.now() - 15*60000)) {
                            return search(ISBN);
                        }
                        else return book;
                    }
                }
            })
            .catch(err => console.log(err))
    }
}

module.exports = BookSearch;
