/**
 * Created by User on 15.06.2017.
 */
/**
 * Created by User on 13.06.2017.
 */
const rp = require('request-promise');
const cheerio = require('cheerio');
const iconv = require ('iconv-lite');

module.exports.parse = (ISBN) => {
    console.log('REQUEST');
    return new Promise((resolve, reject) => {
        return rp({
            url : 'http://www.ozon.ru/?context=search&text=' + ISBN +'&store=1,0',
            encoding: null
        })
            .then(body => {

                let book = {};
                let cheerioBody = cheerio.load(iconv.decode(body, 'win1251'));
                return checkSearch(cheerioBody)
                    .then(newBody => {
                        if (newBody) cheerioBody = cheerio.load(iconv.decode(newBody, 'win1251'));
                        return true;
                    })
                    .then(() => {
                        let title = cheerioBody('h1.bItemName')
                            .text();
                        if (!title) {
                            reject("No book for current ISBN");
                        }
                        else return true
                    })
                    .then(() => getTitle(cheerioBody))
                    .then((title) => book.title = title)
                    .then(() => getPrice(cheerioBody))
                    .then((price) => book.price = Number(price))
                    .then(() => getDescription(cheerioBody))
                    .then((description) => book.description = description)
                    .then(() => getProperties(cheerioBody))
                    .then((properties) => book.properties = properties)
                    .then(() => getPictures(cheerioBody))
                    .then((imageUrls) => {
                        book.imageUrls = imageUrls;
                        return resolve(book);
                    })
                    .catch(err => {
                        throw err;
                    })
            })
            .catch(err => reject(err))
    })
};

function getTitle($) {
    return new Promise((resolve, reject) => {
        let title = $('h1.bItemName')
            .text();

        if (!title) reject ('Failed find title');
        console.log('Title found - ' + title);
        resolve(title);
    })
}

function getDescription($) {
    return new Promise((resolve, reject) => {
        let noscriptFolder = cheerio.load($('div.bDescriptionFold')
            .children('noscript')
            .html());
        let description = noscriptFolder('div.eProductDescriptionText_text')
            .text();

        console.log('Description found - ' + description);
        if (!description) reject ('Failed find description');
        resolve(description);
    })
}

function getPrice ($) {
    return new Promise((resolve, reject) => {
        let noScriptFolder = cheerio.load($('div.bSaleBlocksContainer')
            .children()
            .text());

        let price = noScriptFolder('div.bSale_BasePriceCover')
            .text();

        console.log('price found - ' + price.match(/.*[0-9]/)[0].trim());

        if (!price) reject ('Failed find price');
        resolve(price.match(/.*[0-9]/)[0].trim());
    })
}

function getProperties ($) {
    return new Promise((resolve, reject) => {
        let noscriptFolder = cheerio.load($('div.bItemProperties')
            .children('noscript')
            .html());

        let properties = {};
        noscriptFolder('div.eItemProperties_line').each(function(i, elem) {
            let propText = [];
            let propTextFolder = $(this)
                .children('div.eItemProperties_text');

            if(propTextFolder.children().length === 1) {
                propText = (propTextFolder.children().text()).trim();
            }
            else if (propTextFolder.children().length > 1) {
                propTextFolder.children().each(function(i, elem) {
                    propText.push(($(elem).text()).trim())
                })
            }
            else propText = (propTextFolder.text()).trim();
            properties[
                (
                    $(this)
                        .children('div.eItemProperties_name')
                        .text()
                ).replace('.', ' ')
                ] = propText;
        });

        console.log('properties found - ' + JSON.stringify(properties));

        if (!properties) reject ('Failed find properties');
        resolve(properties);
    })
}

function getPictures ($) {

    return new Promise((resolve, reject) => {
        let jsonFolder = $('div.bContentColumn')
            .children()
            .html();
        jsonFolder.toString();
        let array = [];
        let regex = /"Original":"(.*?)"/g;
        let res;
        while (res = regex.exec(jsonFolder)) {
            array.push('http:' + res[1]);
        }
        console.log(array);
        resolve(array);
    });
}

function checkSearch ($) {
    return new Promise((resolve, reject) => {

        let searchResult = $('div.bSearchResult')
            .html();

        if(searchResult) {
            let firstBookUrl = $('div#bTilesModeShow')
                .children().attr('data-href');
            console.log(firstBookUrl);
            return rp({
                url : 'http://www.ozon.ru' + firstBookUrl,
                encoding: null
            })
                .then(body => resolve(body))
        }
        else {
            console.log('Vse norm');
            resolve(null);
        }
    });
}
