const express = require('express');
const router = express.Router();

const Posts = require("../models/PostsModel")
const Comments = require("../models/CommentsModel")
const Users = require("../models/UsersModel")
const Followers = require("../models/FollowerModel")
const Groups = require("../models/GroupsModel")
const UsersGroup = require("../models/UsersGroupsModel")

/* GET 10 posts */
router.get('/post/:id', async function(req, res) {
  if (req.params.id === 'id')
    await Posts.find().limit(10)
        .then(posts => res.json(posts))
        .catch(err => res.json(err))
  else
    await Posts.find({idUser: req.params.id}).limit(10)
        .then(posts => res.json(posts))
        .catch(() => {
          res.status(500);
          res.json({"error":"Something went wrong"});
        })
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
router.get('/artists/:id', async function(req, res) {
    if (req.params.id === 'id')
        await Users.find().limit(10).select('-password')
            .then(artists => res.json(artists))
            .catch(err => res.json(err))
    else {
        let artists = [];
        await Users.find().limit(5).select('-password')
            .then(users => {
                 artists = users.map(async artist => {
                        await Followers.exists({idUser: req.params.id, idFollowed: artist._id}).then(follow =>{
                            artist.set("follow", follow , {strict: false});
                        })
                     return artist
                    })
                Promise.all(artists).then(artist =>
                    res.json(artist))

            })
            .catch((err) => {
                res.status(500);
                res.json({"error": err});
            })
    }
});

/* GET 10 posts */
router.get('/groups/:id', async function(req, res) {
    if (req.params.id === 'id')
        await Groups.find().limit(5)
            .then(posts => res.json(posts))
            .catch(err => res.json(err))
    else {
        let groupsFinal = [];
        await Groups.find().limit(5)
            .then(groups => {
                groupsFinal = groups.map(async group => {
                    await UsersGroup.exists({idUser: req.params.id, idGroup: group._id}).then(follow => {
                        group.set("member", follow, {strict: false});
                    })
                    return group
                })
                Promise.all(groupsFinal).then(artist =>
                    res.json(artist))

            })
            .catch((err) => {
                res.status(500);
                res.json({"error": err});
            })
    }
});

module.exports = router;
