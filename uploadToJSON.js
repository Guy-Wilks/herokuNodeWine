var http = require('http');
var url = require('url');
var express = require('express');
var app = express();
var queryString = require('querystring');
var request = require('request');

app.set('port', (process.env.PORT || 5000));


// views is directory for all template files
app.use(express.static(__dirname + '/views/pages'));
app.use(express.static(__dirname + '/public'));

// set the view engine to ejs
app.set('view engine', 'ejs');



app.get("/authorize", function(req, res) {
    // Authorization (initiated from your Swift App) is requested at this endpoint

    res.redirect(AUTHORIZE_URI + "?" + queryString.stringify({
        response_type: "code",
        scope: "read_write",
        client_id: CLIENT_ID,
        force_login: true

    }));
});


app.get('/redirect', function(req, res){

    //Users are redirected to this endpoint after their request to connect to Stripe is approved.

    var authCode = req.param('code');
    var scope = req.param('scope');
    var error = req.param('error');
    var errorDescription = req.param('error_description');
    var objectID = req.param('object_id');


    if (error) {
        res.render('pages/fail');
    } else {

        // Make /oauth/token endpoint POST request
        request.post({
            url: TOKEN_URI,
            form: {
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                code: authCode,
                client_secret: API_KEY
            }
        }, function(err, response, body) {

            if (err) {
                res.render('pages/fail');
                return;
            }

            // {
            //   "token_type": "bearer",
            //   "stripe_publishable_key": PUBLISHABLE_KEY,
            //   "scope": "read_write",
            //   "livemode": false,
            //   "stripe_user_id": USER_ID,
            //   "refresh_token": REFRESH_TOKEN,
            //   "access_token": ACCESS_TOKEN
            // }

            var stripeUserID = JSON.parse(body).stripe_user_id;

            res.render('pages/success', {stripe_user_id: stripeUserID});

        });
    }
});

app.get('/', function (req, res) {

    var sql = require("mssql");

    // config for your database
    var config = {
        user: 'guy',
        password: 'Wilks2003',
        server: 'winedb.database.windows.net',
        database: 'winedb',
        options: {encrypt: true, database: 'winedb'}
    };

    // connect to your database
    sql.connect(config, function (err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        // query to the database and get the records
        request.query('SELECT * FROM wineTest', function (err, recordset) {

            if (err) console.log(err)

            // send records as a response
            res.send(recordset);

        });
    });
});

http.createServer(function (req, res) {
    var query = url.parse(req.url,true).query;
    res.end(JSON.stringify(query.id));
}).listen(app.get('port'));

