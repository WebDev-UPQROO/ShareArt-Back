// noinspection JSCheckFunctionSignatures
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require("body-parser");
const logger = require('morgan');
const multer = require('multer');
mongoose.Promise = require('bluebird');

const homeRouter = require('./routes/home');
const profileRouter = require('./routes/profile');
const groupRouter = require('./routes/group');
const authRouter = require('./routes/auth');

const app = express();

//DB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c0a6k.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on("error", err => {
    console.log("err", err);
})
mongoose.connection.on("open", () => {
    console.log("db connected");
})
//Cors
app.use(cors({origin: '*'}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// parse application/json
app.use(bodyParser.json())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));


// Save file locally
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname+'/uploads');
    },
    filename: function (req, file, cb){
        cb(null, file.fieldname + '-' + file.originalname);
    }
});
//app.use(multer({storage: storage}).array('images'));
app.use(multer({storage: storage}).single('image'));

const URL = '/shareart/v1/';
app.use(URL + 'home', homeRouter);
app.use(URL + 'profile', profileRouter);
app.use(URL + 'group', groupRouter);
app.use(URL + 'auth', authRouter);

module.exports = app;
