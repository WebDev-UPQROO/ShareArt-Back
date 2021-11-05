// noinspection JSCheckFunctionSignatures

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const homeRouter = require('./routes/home');
const profileRouter = require('./routes/profile');
const usersRouter = require('./routes/groups');
const bodyParser = require("body-parser");

const app = express();

const URL = '/shareart/'

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

app.use(URL+'home', homeRouter);
app.use(URL+'users', usersRouter);
app.use(URL+'profile', profileRouter);

module.exports = app;
