const express = require('express');
const router = express.Router();

const User = require("../models/UserModel");
const Post = require("../models/PostModel");
const Follower = require("../models/FollowerModel")
const Group = require("../models/GroupModel")
const UserGroup = require("../models/UserGroupModel")

router.get('/:id', async function (req, res) {
    const {id} = req.params;
    await User.findOne({'_id': id})
        .populate('categories')
        .then(user => res.json(user))
        .catch((err) => {
            res.status(404);
            res.json({"error": "User profile not found"});
            console.log(err)
        })
});

router.put('/posts', async function (req, res) {
    const {id, idPost} = req.body;
    let post = [];
    try {
        if (idPost == null) {
            post = await Post.find({'user': id})
                .populate('user')
                .sort({'_id': -1})
                .limit(10);
        } else {
            post = await Post.find({'user': id})
                .populate('user')
                .where('_id').lt(idPost)
                .sort({'_id': -1})
                .limit(10);
        }
        res.json(post);
    }catch(err){
        res.status(500);
        res.json({"error": err});
    }
});

router.put('/:follow', async function (req, res) {
    const {follow} = req.params;
    const {id, idFollow, idUser} = req.body;

    let follows;
    let users = [];
    let followers = [];

    let filter1 = 'user';
    let filter2 = 'followed';

    if (follow === 'followers') {
        filter1 = 'followed';
        filter2 = 'user';
    }

    if (idFollow == null)
        follows = await Follower.find({filter1: id})
            .sort({'_id': -1})
            .limit(10);
    else
        follows = await Follower.find({filter1: id})
            .where('_id').lt(idFollow)
            .sort({'_id': -1})
            .limit(10);

    follows.forEach(follow => {
        users.push(User.findOne({'_id': follow[filter2]})
            .select('-categories')
            .then(user => user.set('idFollow', follow._id, {strict: false})))
    })

    const following = await Promise.all(users);

    if (idUser == null)
        res.json(following);
    else {
        followers = following.map(async follower => {
            await Follower.exists({'user': idUser, 'followed': follower._id})
                .then(follow => follower.set('follow', follow, {strict: false}))

            return follower
        })
        const response = await Promise.all(followers);
        res.json(response);
    }

});

router.put('/groups', async function (req, res) {
    const {id, idGroup, idUser} = req.body;
    let groups = [];
    let groupRes = [];
    let userGroups;

    if (idGroup == null)
        userGroups = await UserGroup.find({'user': id})
            .sort({'_id': -1})
            .limit(10);
    else
        userGroups = await UserGroup.find({'user': id})
            .where('_id').lt(idGroup)
            .sort({'_id': -1})
            .limit(10);

    userGroups.forEach(userGroup => {
        groups.push(Group.findOne(
            {'_id': userGroup.group })
            .then(group => group.set('idUserGroup', userGroup._id, {strict: false})))
    })

    const groupList = await Promise.all(groups);

    if (idUser == null) {
        res.json(groupList);
    } else {
        groupRes = groupList.map(async group => {
            await UserGroup.exists({'user': idUser, 'group': group._id})
                .then(member => group.set('member', member, {strict: false}))

            return group
        })
        const response = await Promise.all(groupRes);
        res.json(response);
    }
});

module.exports = router;
