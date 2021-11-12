// noinspection JSCheckFunctionSignatures
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const homeRouter = require('./routes/home');
const profileRouter = require('./routes/profile');
const groupsRouter = require('./routes/groups');
const bodyParser = require("body-parser");

const app = express();

const URL = '/shareart/v1/'

//DB Connection
const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c0a6k.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('DB connected'))
    .catch(err => console.log(err));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    res.header('Allow', 'OPTIONS, GET, POST, PUT, DELETE');
    next();
});

app.use(URL+'home', homeRouter);
app.use(URL+'profile', profileRouter);
app.use(URL+'groups', groupsRouter);

module.exports = app;
