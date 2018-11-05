var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var favicon = require('serve-favicon');


var configDB = require('./config/database.js');

//Connect to our Mongo Server
mongoose.connect(configDB.url, {useNewUrlParser:true}); 

require('./config/passport')(passport); 

app.use('/', express.static(path.join(__dirname, 'public')));


app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser()); 
app.set('view engine', 'ejs'); 
app.use(favicon(path.join(__dirname,'public','images','scroll.ico')));

app.use(session({ secret: 'bobs' })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); 

//Initialize the routing with our passport
require('./app/routes.js')(app, passport); 

app.listen(port);
console.log('Server started on port: ' + port);



/* This program was initially built on top of a template found in the following citation
***************************************************************************************
*    Title: Easy Node Authentication: Setup and Local
*    Author: Chris Sevilleja
*    Date: November 5, 2018
*    Code version: 1.0
*    Availability: https://scotch.io/tutorials/easy-node-authentication-setup-and-local
*
***************************************************************************************/