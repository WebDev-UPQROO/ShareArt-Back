const express = require('express');
const router = express.Router();

const Users = require("../models/UsersModel")

router.get('/:id', async function(req, res) {
    await Users.findOne({_id: req.params.id}).select('-password')
        .then(posts => res.json(posts))
        .catch(() => {
            res.status(404);
            res.json({"error":"User profile not found"});
        })
});

module.exports = router;
