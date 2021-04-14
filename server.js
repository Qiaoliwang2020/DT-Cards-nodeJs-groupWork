let express = require("express");
const session = require('express-session')
const passport = require('passport');
const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;
const CALLBACK_URL = "/ibm/cloud/appid/callback";

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

  app.use("/protected", passport.authenticate(WebAppStrategy.STRATEGY_NAME));

  // // This will statically serve the protected page (after authentication, since /protected is a protected area):
app.use('/protected', express.static("protected"));

app.get("/logout", (req, res) => {
	WebAppStrategy.logout(req);
	res.redirect("/");
});

//Serves the identity token payload
app.get("/protected/api/idPayload", (req, res) => {
	res.send(req.session[WebAppStrategy.AUTH_CONTEXT].identityTokenPayload);
});

app.get('/error', (req, res) => {
	res.send('Authentication Error');
});

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

function getAppIDConfig() {
	let config;
	
	try {
		// if running locally we'll have the local config file
		config = require('./localdev-config.json');
	} catch (e) {
		if (process.env.APPID_SERVICE_BINDING) { // if running on Kubernetes this env variable would be defined
			config = JSON.parse(process.env.APPID_SERVICE_BINDING);
			config.redirectUri = process.env.redirectUri;
		} else { // running on CF
			let vcapApplication = JSON.parse(process.env["VCAP_APPLICATION"]);
			return {"redirectUri" : "https://" + vcapApplication["application_uris"][0] + CALLBACK_URL};
		}
	}
	return config;
}

//this is only needed for Cloud foundry 
require("cf-deployment-tracker-client").track();
