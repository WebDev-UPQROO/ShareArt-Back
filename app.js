// noinspection JSCheckFunctionSignatures
const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const cors = require('cors');
const logger = require('morgan');
const multer = require('multer');

const homeRouter = require('./routes/home');
const profileRouter = require('./routes/profile');
const groupRouter = require('./routes/group');
const authRouter = require('./routes/auth');

require('dotenv').config();

const app = express();

//DB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c0a6k.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('db connected'))
    .catch(err => console.log(err));

//Cors
app.use(cors({origin: '*'}));

// parse application/x-www-form-urlencoded and application/json
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//logger
app.use(logger('dev'));

// Save files in local
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname+'/uploads');
    },
    filename: function (req, file, cb){
        cb(null, file.fieldname + '-' + file.originalname);
    }
});
app.use(multer({storage: storage}).array('images'));

const URL = '/shareart/v1/';
app.use(URL + 'home', homeRouter);
app.use(URL + 'profile', profileRouter);
app.use(URL + 'group', groupRouter);
app.use(URL + 'auth', authRouter);

module.exports = app;
