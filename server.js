let express = require("express");
const session = require('express-session')
const passport = require('passport');
const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;
const CALLBACK_URL = "/ibm/cloud/appid/callback";

let app = express();
let routes = require('./routes')
let path = require('path');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbTest:dbTest@study.mqzkl.mongodb.net/reckoning?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect();

let port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));


app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use('/', routes({client}));

/** IBM APP ID for login and register **/
app.use(session({
	secret: "123456",
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

let webAppStrategy = new WebAppStrategy(getAppIDConfig());
passport.use(webAppStrategy);

passport.serializeUser(function(user, cb) {
	cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
	cb(null, obj);
});

app.get(CALLBACK_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME, {failureRedirect: '/error'}));

app.use("/home", passport.authenticate(WebAppStrategy.STRATEGY_NAME));

// // This will statically serve the home page (after authentication, since /home is a home area):
app.use('/home', express.static("home"));

app.get("/logout", (req, res) => {
	WebAppStrategy.logout(req);
	res.redirect("/");
});

//Serves the identity token payload
app.get("/home/api/idPayload", (req, res) => {
	res.send(req.session[WebAppStrategy.AUTH_CONTEXT].identityTokenPayload);
});

app.get('/error', (req, res) => {
	res.send('Authentication Error');
});

app.listen(port, () => {
	console.log("Listening on port ", port);
	//console.log(process.env.NODE_ENV)
});


function getAppIDConfig() {
	let config;
	try {
		config = require('./localdev-config.json');
		// if running locally we'll have the local config file
		if(process.env.NODE_ENV == 'dev'){
			config.redirectUri = "http://localhost:8080/ibm/cloud/appid/callback"
		}

	} catch (e) {
		console.log(e)
	}
	return config;
}

//this is only needed for Cloud foundry
require("cf-deployment-tracker-client").track();