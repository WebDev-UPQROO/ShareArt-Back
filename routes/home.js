const express = require('express');
const router = express.Router();

const Posts = require("../models/PostsModel")
const Comments = require("../models/CommentsModel")
const Users = require("../models/UsersModel")
const Followers = require("../models/FollowerModel")
const Groups = require("../models/GroupsModel")
const UsersGroup = require("../models/UsersGroupsModel")
const mongoose = require("mongoose");

/* GET 10 posts */
router.put('/post', async function(req, res) {
    let ids = [];
    let post;

    try {
        if (req.body.idUser == null) {
            if (req.body.idPost == null)
                post = await Posts.find()
                    .sort({_id: -1})
                    .limit(10);
            else
                post = await Posts.find()
                    .where('_id').lt(req.body.idPost)
                    .sort({_id: -1})
                    .limit(10);

        } else {
            const follows = await Followers.aggregate([
                {$match: {idUser: mongoose.Types.ObjectId(req.body.idUser)}},
                {$sample: {size: 500}}

            ]);
            ids = follows.map(follow => {
                Followers.hydrate(follow);
                return follow.idFollowed;

            });
            if (req.body.idPost == null)
                post = await Posts.find()
                    .where("idUser").in(ids)
                    .sort({_id: -1})
                    .limit(10);
            else
                post = await Posts.find()
                    .where("idUser").in(ids)
                    .where('_id').lt(req.body.idPost)
                    .sort({_id: -1})
                    .limit(10);
        }
        res.json(post);
    } catch (err) {
        res.status(500);
        res.json({"error": err});
    }

});
/* GET comments */
router.put('/comments', async function(req, res) {
    let comments = [];

    req.body.comments.forEach(comment => comments.push(Comments.findOne({_id: comment})));
    Promise.all(comments)
        .then(response => res.json(response))
        .catch(() => {
            res.status(500);
            res.json({"error":" Something went wrong"});
        });
});
/* GET 10 Artists */
router.put('/artists', async function (req, res) {
    let artist = await Users.find()
        .select('-password')
        .select('-idCategories')
        .limit(10);

    if (req.body.idUser !== null) {
        let artists = artist.map(async artist => {
            await Followers.exists({idUser: req.body.idUser, idFollowed: artist._id})
                .then(follow => (artist.set("follow", follow, {strict: false})));
            return artist
        });
        artist = await Promise.all(artists);
    }
    res.json(artist);
});

/* GET 10 groups */
router.put('/groups', async function(req, res) {
    let group = await Groups.find().limit(10);

    if (req.body.idUser !== null){
        let groups = group.map(async group => {
            await UsersGroup.exists({idUser: req.body.idUser, idGroup: group._id})
                .then(member => (group.set("member", member, {strict: false})))
            return group
        });
        group = await  Promise.all(groups);
    }
    res.json(group);
});

module.exports = router;
