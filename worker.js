const { parentPort } = require('worker_threads');
const request = require('request');
const async = require('async');
const fs = require('fs');
const cheerio = require('cheerio');
var moment = require('moment-timezone')

const categories = {
    "cpu": ["CPU", "中央處理器", "處理器", 1],
    "motherboard": ["主機板", 4],
    "memory": ["記憶體", 5],
};

function getCodeByCatName(name) {
    let keys = Object.keys(categories);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (categories[key].indexOf(name) > -1) {
            return key;
        }
    }
    return "unknown";
}

let global = {
    data: {

    },
    lastUpdate: null
};

function addProduct(company, code, name, price) {
    if (!global.data[code]) global.data[code] = {};
    if (!global.data[code][company]) global.data[code][company] = [];
    global.data[code][company].push({
        name,
        price
    });
}

async.parallel([
    function (finish) {
        // TerminalHK All
        request('http://www.terminalhk.com/api/public/product', function (error, response, body) {
            try {
                let json = JSON.parse(body);
                let products = json.products;
                for (let product of products) {
                    var code = getCodeByCatName(product.category);
                    addProduct("terminalhk", code, product.name, product.price);
                }
            } catch {

            }
            finish(null, true);
        });
    },

    function (finish) {
        // Faroll ALL
        request('https://www.faroll.com/api/products/all', function (error, response, body) {
            try {
                let json = JSON.parse(body);
                let products = json.products;
                for (let product of products) {
                    var code = getCodeByCatName(product.category_id);
                    addProduct("faroll", code, product.product_name, product.options[0].price - product.options[0].discount);
                }
            } catch{

            }
            finish(null, true);
        });
    },

    function (finish) {
        // Jumbo computer CPU
        try {
            request('http://www.jumbo-computer.com/pricelist.aspx?id=3', function (error, response, body) {
                const $ = cheerio.load(body);
                $('.gvProducts tr td:first-child').each(function (i, elem) {
                    let productName = $(this).text();
                    let price = $(this).next().text().replace('HK$ ', '');
                    //console.log(productName)
                    addProduct("jumbo", "cpu", productName, price);
                });
                finish(null, true);
            });
        }
        catch {

        }
    },
    function (finish) {
        // Jumbo computer MB
        try {
            request('http://www.jumbo-computer.com/pricelist.aspx?id=1', function (error, response, body) {
                const $ = cheerio.load(body);
                $('.gvProducts tr td:first-child').each(function (i, elem) {
                    let productName = $(this).text();
                    let price = $(this).next().text().replace('HK$ ', '');
                    //console.log(productName)
                    addProduct("jumbo", "motherboard", productName, price);
                });
                finish(null, true);
            });
        }
        catch {

        }
    },
    function (finish) {
        // Jumbo computer DDR3
        try {
            request('http://www.jumbo-computer.com/pricelist.aspx?id=137', function (error, response, body) {
                const $ = cheerio.load(body);
                $('.gvProducts tr td:first-child').each(function (i, elem) {
                    let productName = $(this).text();
                    let price = $(this).next().text().replace('HK$ ', '');
                    //console.log(productName)
                    addProduct("jumbo", "memory", productName, price);
                });
                finish(null, true);
            });
        }
        catch {

        }
    },
    function (finish) {
        // Jumbo computer DDR4
        try {
            request('http://www.jumbo-computer.com/pricelist.aspx?id=4', function (error, response, body) {
                const $ = cheerio.load(body);
                $('.gvProducts tr td:first-child').each(function (i, elem) {
                    let productName = $(this).text();
                    let price = $(this).next().text().replace('HK$ ', '');
                    //console.log(productName)
                    addProduct("jumbo", "memory", productName, price);
                });
                finish(null, true);
            });
        }
        catch {

        }
    },


    function (finish) {
        // Centralfield CPU
        request('https://www.centralfield.com/price-list/price-list-cpu/', function (error, response, body) {
            const $ = cheerio.load(body);
            $('tbody>tr>td:first-child').each(function (i, elem) {
                let productName = $(this).text();
                //console.log(productName);
                if (productName && productName.length > 0) {
                    let price = $(this).next().text();
                    addProduct("centralfield", "cpu", productName, price);
                }
            });
            finish(null, true);
        });
    },
    function (finish) {
        // Centralfield MB
        request('https://www.centralfield.com/price-list/price-list-mbd/', function (error, response, body) {
            const $ = cheerio.load(body);
            $('tbody>tr>td:first-child').each(function (i, elem) {
                let productName = $(this).text();
                if (productName && productName.length > 0) {
                    let price = $(this).next().text();
                    addProduct("centralfield", "motherboard", productName, price);
                }
            });
            finish(null, true);
        });
    },
    function (finish) {
        // Centralfield MB
        request('https://www.centralfield.com/price-list/price-list-ram/', function (error, response, body) {
            const $ = cheerio.load(body);
            $('tbody>tr>td:first-child').each(function (i, elem) {
                let productName = $(this).text();
                if (productName && productName.length > 0) {
                    let price = $(this).next().text();
                    addProduct("centralfield", "memory", productName, price);
                }
            });
            finish(null, true);
        });
    },

    function (finish) {
        request('http://www.secomputer.com.hk/pricelist.php?ProductTypeID=3', function (error, response, body) {
            const $ = cheerio.load(body);
            let products = $('span[id^=ProductName]');
            let prices = $('span[id^=Price]');
            products.each(function (i, elem) {
                let productName = $(this).text();
                if (productName && productName.length > 0) {
                    let price = prices.eq(i).text();
                    addProduct("SEComputer", "cpu", productName, price);
                }
            });
            finish(null, true);
        });
    },
    function (finish) {
        request('http://www.secomputer.com.hk/pricelist.php?ProductTypeID=2', function (error, response, body) {
            const $ = cheerio.load(body);
            let products = $('span[id^=ProductName]');
            let prices = $('span[id^=Price]');
            products.each(function (i, elem) {
                let productName = $(this).text();
                if (productName && productName.length > 0) {
                    let price = prices.eq(i).text();
                    addProduct("SEComputer", "motherboard", productName, price);
                }
            });
            finish(null, true);
        });
    },
    function (finish) {
        request('http://www.secomputer.com.hk/pricelist.php?ProductTypeID=1', function (error, response, body) {
            const $ = cheerio.load(body);
            let products = $('span[id^=ProductName]');
            let prices = $('span[id^=Price]');
            products.each(function (i, elem) {
                let productName = $(this).text();
                if (productName && productName.length > 0) {
                    let price = prices.eq(i).text();
                    addProduct("SEComputer", "memory", productName, price);
                }
            });
            finish(null, true);
        });
    },
], function (errs, results) {
    if (errs) throw errs;
    process.env.TZ = 'Hongkong';
    moment.locale('zh-HK');
    global.lastUpdate = moment().format('DD/MM/YYYY HH:mm:ss');
    fs.writeFile(`${__dirname}/public/results.json`, JSON.stringify(global), function (err) {
        if (err) {
            return console.log(err);
        }
        global = {};
    });
    parentPort.postMessage({ });
    //parentPort.postMessage({ data: JSON.stringify(global) });
});