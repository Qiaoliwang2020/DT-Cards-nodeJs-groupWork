let express = require("express");
let app = express();
let routes = require('./routes')
let path = require('path');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:dbUser@hyperledgercertificate.hgp6r.mongodb.net/firstdb?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect();
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', routes({client}));

// app.get("/record", (req, res) => {
//   const { insectsAmount, areaID } = req.query;
//   res.send(`Area ${areaID} has ${insectsAmount} insects`);
// })


// app.use((req, res, next) => {
//   return next(createError(404, "File not found"));
// })

// app.use((err, req, res, next) => {
//   const status = err.status || 500;
//   res.status(status);
//   res.send(err.message);
// })


app.listen(port, () => {
  console.log("Listening on port ", port);
});

//this is only needed for Cloud foundry 
require("cf-deployment-tracker-client").track();
