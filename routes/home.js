const express = require('express');
const router = express.Router();

const Posts = require("../models/PostModel")
const Comments = require("../models/CommentModel")
const Users = require("../models/UserModel")
const Followers = require("../models/FollowerModel")
const Groups = require("../models/GroupModel")
const UsersGroup = require("../models/UserGroupModel")
const Category = require("../models/CategoryModel")
const mongoose = require("mongoose");

/* GET 10 posts */
router.put('/post', async function (req, res) {
    const {idUser, idPost} = req.body;
    let ids = [];
    let post;

    try {
        if (idUser == null) {
            if (idPost == null)
                post = await Posts.find()
                    .populate('user')
                    .sort({'_id': -1})
                    .limit(10);
            else
                post = await Posts.find()
                    .populate('user')
                    .where('_id').lt(idPost)
                    .sort({'_id': -1})
                    .limit(10);

        } else {
            const follows = await Followers.aggregate([
                {$match: {user: mongoose.Types.ObjectId(idUser)}},
                {$sample: {size: 500}}

            ]);
            ids = follows.map(follow => {
                Followers.hydrate(follow);
                return follow.followed;

            });
            if (idPost == null)
                post = await Posts.find()
                    .populate('user')
                    .where('user').in(ids)
                    .sort({'_id': -1})
                    .limit(10);
            else
                post = await Posts.find()
                    .populate('user')
                    .where('user').in(ids)
                    .where('_id').lt(idPost)
                    .sort({'_id': -1})
                    .limit(10);
        }
        res.json(post);
    } catch (err) {
        res.status(500);
        res.json({'error': err});
    }

});
/* GET comments */
router.put('/comments', async function(req, res) {
    const {comment} = req.body;
    let comments = [];

    comment.forEach(comment => comments.push(Comments.findOne({'_id': comment})));
    Promise.all(comments)
        .then(response => res.json(response))
        .catch(() => {
            res.status(500);
            res.json({'error':'Something went wrong'});
        });
});
/* GET 10 Artists */
router.put('/artists', async function (req, res) {
    const {idUser} = req.body;
    let artist = await Users.find()
        .select('-categories')
        .limit(10);

    if (idUser !== null) {
        let artists = artist.map(async artist => {
            await Followers.exists({'user': idUser, 'followed': artist._id})
                .then(follow => (artist.set('follow', follow, {strict: false})));
            return artist
        });
        artist = await Promise.all(artists);
    }
    res.json(artist);
});

/* GET 10 groups */
router.put('/groups', async function(req, res) {
    const {idUser} = req.body;
    let group = await Groups.find().limit(10);

    if (idUser !== null){
        let groups = group.map(async group => {
            await UsersGroup.exists({'user': idUser, 'group': group._id})
                .then(member => (group.set('member', member, {strict: false})))
            return group
        });
        group = await Promise.all(groups);
    }
    res.json(group);
});

module.exports = router;
