const express = require('express');
const router = express.Router();


const Follower = require("../models/FollowerModel")

router.post('/', async function (req, res) {
    const {idFollower, idFollowed} = req.body;
    const body = {'user': idFollower, 'followed': idFollowed};

    let match = await Follower.exists(body);

    if (match) {
        await Follower.deleteOne(body);

    } else {
        const follow = new Follower(body);
        await follow.save();
    }
    res.json({"message": "ok", "follow": !match});

});

module.exports = router;
