const express = require('express');
const router = express.Router();

const Users = require("../models/UsersModel");
const Posts = require("../models/PostsModel");
const Followers = require("../models/FollowerModel")
const Groups = require("../models/GroupsModel")
const UsersGroup = require("../models/UsersGroupsModel")

router.get('/:id', async function (req, res) {
    await Users.findOne({_id: req.params.id})
        .select('-password')
        .select('-idCategories')
        .then(user => res.json(user))
        .catch(() => {
            res.status(404);
            res.json({"error": "User profile not found"});
        })
});

router.put('/posts', async function (req, res) {
    let post = [];
    try {
        if (req.body.idPost == null) {
            post = await Posts.find({idUser: req.body.id})
                .sort({_id: -1})
                .limit(10);
        } else {
            post = await Posts.find({idUser: req.body.id})
                .where('_id').lt(req.body.idPost)
                .sort({_id: -1})
                .limit(10);
        }
        res.json(post);
    }catch(err){
        res.status(500);
        res.json({"error": err});
    }
});

router.put('/:follow', async function (req, res) {
    let follows;
    let users = [];
    let followers = [];

    let filter1 = 'idUser';
    let filter2 = 'idFollowed';

    if(req.params.follow === 'followers') {
        filter1 = 'idFollowed';
        filter2 = 'idUser';
    }

    if (req.body.idFollow == null)
        follows = await Followers.find({filter1: req.body.id})
            .sort({_id: -1})
            .limit(10);
    else
        follows = await Followers.find({filter1: req.body.id})
            .where("_id").lt(req.body.idFollow)
            .sort({_id: -1})
            .limit(10);

    follows.forEach(follow => {
        users.push(Users.findOne(
            {_id: follow[filter2]})
            .select('-password').select('-idCategories')
            .then(user => user.set("idFollow", follow._id, {strict: false})))
    })

    const following = await Promise.all(users);

    if (req.body.idUser == null)
        res.json(following);
    else {
        followers = following.map(async follower => {
            await Followers.exists({idUser: req.body.idUser, idFollowed: follower._id})
                .then(follow => follower.set("follow", follow, {strict: false}))

            return follower
        })
        const response = await Promise.all(followers);
        res.json(response);
    }

});

router.put('/groups', async function (req, res) {
    let groups = [];
    let groupRes = [];
    let userGroups;

    if (req.body.idGroup == null)
        userGroups = await UsersGroup.find({"idUser": req.body.id})
            .sort({_id: -1})
            .limit(10);
    else
        userGroups = await UsersGroup.find({"idUser": req.body.id})
            .where("_id").lt(req.body.idGroup)
            .sort({_id: -1})
            .limit(10);

    userGroups.forEach(userGroup => {
        groups.push(Groups.findOne(
            {_id: userGroup.idGroup })
            .then(group => group.set("idUserGroup", userGroup._id, {strict: false})))
    })

    const groupList = await Promise.all(groups);

    if (req.body.idUser == null) {
        res.json(groupList);
    } else {
        groupRes = groupList.map(async group => {
            await UsersGroup.exists({idUser: req.body.idUser, idGroup: group._id})
                .then(member => group.set("member", member, {strict: false}))

            return group
        })
        const response = await Promise.all(groupRes);
        res.json(response);
    }
});

module.exports = router;
