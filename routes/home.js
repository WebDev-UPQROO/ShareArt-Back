const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();

const Post = require("../models/PostModel")
const Comment = require("../models/CommentModel")
const User = require("../models/UserModel")
const Follower = require("../models/FollowerModel")
const Group = require("../models/GroupModel")
const UserGroup = require("../models/UserGroupModel")
require("../models/CategoryModel")


/* GET 10 posts */
router.put('/post', async function (req, res) {
    const {idUser, idPost} = req.body;
    let ids = [];
    let post;
    let posts;

    try {
        if (idUser == null) {
            if (idPost == null)
                post = await Post.find()
                    .populate('user')
                    .sort({'_id': -1})
                    .limit(10);
            else
                post = await Post.find()
                    .populate('user')
                    .where('_id').lt(idPost)
                    .sort({'_id': -1})
                    .limit(10);

        } else {
            const follows = await Follower.aggregate([
                {$match: {user: mongoose.Types.ObjectId(idUser)}},
                {$sample: {size: 500}}
            ]);

            ids = follows.map(follow => {
                Follower.hydrate(follow);
                return follow.followed;
            });
            if (idPost == null)
                post = await Post.find()
                    .populate('user')
                    .where('user').in(ids)
                    .sort({'_id': -1})
                    .limit(10);
            else
                post = await Post.find()
                    .populate('user')
                    .where('user').in(ids)
                    .where('_id').lt(idPost)
                    .sort({'_id': -1})
                    .limit(10);
        }
        posts = post.map(async post => {
            await Comment.find({'post': post._id})
                .then(comments => {
                    let commentList = comments.map(comment => {
                        return comment._id
                    })
                    post.set('comments', commentList)
                })
            return post;
        });
        post = await Promise.all(posts);
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

    comment.forEach(comment =>
        comments.push(
            Comment.findOne({'_id': comment}).populate('user')
        )
    );
    Promise.all(comments)
        .then(response => res.json(response))
        .catch(() => {
            res.status(500);
            res.json({'error': 'Something went wrong'});
        });
});
/* GET 10 Artists */
router.put('/artists', async function (req, res) {
    const {idUser} = req.body;
    let artist = await User.find()
        .select('-categories')
        .limit(10);

    if (idUser !== null) {
        let artists = artist.map(async artist => {
            await Follower.exists({'user': idUser, 'followed': artist._id})
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
    let group = await Group.find().limit(10);

    if (idUser !== null) {
        let groups = group.map(async group => {
            await UserGroup.exists({'user': idUser, 'group': group._id})
                .then(member => (group.set('member', member, {strict: false})))
            return group
        });
        group = await Promise.all(groups);
    }
    res.json(group);
});

router.put('/post/create', async function (req, res){

});

router.post('/post/delete', async function (req, res){


});

router.put('/post/vote', async function (req, res){


});

router.put('/comment/create', async function (req, res){


});

router.post('/comment/delete', async function (req, res){


});

router.put('/comment/vote', async function (req, res){


});


module.exports = router;
