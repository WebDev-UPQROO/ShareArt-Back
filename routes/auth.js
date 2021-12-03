const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require("../models/UserModel");
const Follower = require("../models/FollowerModel")

router.put('/login', async function (req, res) {

    const {username, password} = req.body;

    const exist = await User.exists({'username': username});

    if (exist) {
        const user = await User.findOne({'username': username});
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const token = generateToken(username);
            res.json({'user': user, 'token': token});
        } else {
            res.status(403);
            res.json({"error": "Contraseña incorrecta"});
        }
    } else {
        res.status(403);
        res.json({"error": "Usuario no encontrado"});
    }
});
router.post('/register', async function (req, res) {
    let {name, username,email, password} = req.body;

    const exist = await User.exists({'username': username});

    if (!exist) {
        password = await bcrypt.hash(password, 10);
        const user = new User({name, username, email, password});
        const newUser = await user.save();

        let follow = new Follower({'user': '61aa1f0fc7a8aea2749e226b', 'followed': newUser._id});
        await follow.save();

        follow = new Follower({'user': newUser._id, 'followed': '61aa1f0fc7a8aea2749e226b'});
        await follow.save();

        const token = generateToken(username);
        res.json({'user': newUser, 'token': token});
    } else {
        res.status(403);
        res.json({"error": "El nombre de usuario ya existe"});
    }
});

router.put('/change/password', async function (req, res) {
    const {id,c_password,n_password} = req.body;
    const user = await User.findOne({'_id': id});

    const match = await bcrypt.compare(c_password, user.password);

    if (match) {
        user.password = await bcrypt.hash(n_password, 10);
        user.save().then(response => res.json(response));
    } else {
        res.status(403);
        res.json({"error": "Contraseña incorrecta"});
    }

});

function generateToken(username) {

    return jwt.sign({username: username}, process.env.TOKEN_SECRET, {expiresIn: '24h'});
}

module.exports = router;
