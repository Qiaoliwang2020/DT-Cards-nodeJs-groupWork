const https = require('https');

const defaultCurrency = 'AUD';
module.exports = (amount, fromCurrency, toCurrency, cb)=> {

        let apiKey = 'c7d4eb7dbb5bafba4484';
        fromCurrency = encodeURIComponent(fromCurrency);
        toCurrency = encodeURIComponent(toCurrency) ? encodeURIComponent(toCurrency) :defaultCurrency;
        let query = fromCurrency + '_' + toCurrency;

        let url = 'https://free.currconv.com/api/v7/convert?q='
            + query + '&compact=ultra&apiKey=' + apiKey;

        https.get(url, function(res){
            let body = '';

            res.on('data', function(chunk){
                body += chunk;
            });

            res.on('end', function(){
                try {
                    let jsonObj = JSON.parse(body);

                    let val = jsonObj[query];
                    if (val) {
                        let total = val * amount;
                        cb(null, Math.round(total * 100) / 100);
                    } else {
                        let err = new Error("Value not found for " + query);
                        console.log(err);
                        cb(err);
                    }
                } catch(e) {
                    console.log("Parse error: ", e);
                    cb(e);
                }
            });
        }).on('error', function(e){
            console.log("Got an error: ", e);
            cb(e);
        });
}
