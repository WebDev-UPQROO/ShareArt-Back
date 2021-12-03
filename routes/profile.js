const express = require('express');
const router = express.Router();
const fs = require('fs-extra');

const cloudinary = require('../helpers/fileUpload');
require('../models/MessageModel');

const User = require("../models/UserModel");
const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel")
const Follower = require("../models/FollowerModel")
const Group = require("../models/GroupModel")
const UserGroup = require("../models/UserGroupModel")

router.put('/', async function (req, res) {
    const {id,idUser} = req.body;
    const user  = await User.findOne({'_id': id})
        .populate('categories')
        .catch((err) => {
            res.status(404);
            res.json({"error": "User profile not found"});
            console.log(err)
        })

    if (idUser != null){
        await Follower.exists({'user': idUser, 'followed': id})
            .then(follow => user.set('follow', follow, {strict: false}))
    }
    res.json(user);
});

router.put('/posts', async function (req, res) {
    const {id, idPost} = req.body;
    let post = [];
    let posts = [];
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
    let total;

    if (follow === 'followed') {
        if (idFollow == null) {
            follows = await Follower.find({'user': id})
                .sort({'_id': -1})
                .limit(10);
            total = await Follower.find({'user': id}).countDocuments();
        } else
            follows = await Follower.find({'user': id})
                .where('_id').lt(idFollow)
                .sort({'_id': -1})
                .limit(10);

        follows.forEach(follow => {
            users.push(User.findOne({'_id': follow.followed})
                .select('-categories')
                .then(user => user.set('idFollow', follow._id, {strict: false})))
        })

    } else if (follow === 'followers') {
        if (idFollow == null) {
            follows = await Follower.find({'followed': id})
                .sort({'_id': -1})
                .limit(10);
            total = await Follower.find({'followed': id}).countDocuments();
        }else
            follows = await Follower.find({'followed': id})
                .where('_id').lt(idFollow)
                .sort({'_id': -1})
                .limit(10);

        follows.forEach(follow => {
            users.push(User.findOne({'_id': follow.user})
                .select('-categories')
                .then(user => user.set('idFollow', follow._id, {strict: false})))
        })
    } else {
        res.status(404);
        res.json({"error": "path not found"});
    }

    const following = await Promise.all(users);

    if (idFollow == null && following.length>0)
        following[0].set('total', total, {strict: false})

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

router.put('/picture/cover', async function (req, res){
    const {id} = req.body;
    const user = await User.findOne({'_id': id});

    if (req.files.length > 0) {
        const file = req.files;
        const {path} = file[0];
        user.cover = await cloudinary.upload(path, 'shareart/users/' + user._id + '/profile', 'cover-' + id);
        fs.removeSync(path);
    } else
        user.cover = undefined

    user.save().then(response => res.json(response));

});

router.put('/picture/profile', async function (req, res) {
    const {id} = req.body;
    const user = await User.findOne({'_id': id});

    if (req.files.length > 0) {
        const file = req.files;
        const {path} = file[0];
        user.photo = await cloudinary.upload(path, 'shareart/users/' + user._id + '/profile', 'photo-' + id)
        fs.removeSync(path);
    } else
        user.photo = undefined;

    user.save().then(response => res.json(response));
});

router.put('/update/profile', async function (req, res){
    const {id,bio,birthday,categories}= req.body;

    const user = await User.findOne({'_id': id});
    user.bio = bio;
    user.birthday = birthday;
    user.categories = categories;

    user.save().then(response => res.json(response));
});

router.put('/update/info', async function (req, res){
    const {id,name,username,email}= req.body;

    const user = await User.findOne({'_id': id});
    user.name = name;
    user.username = username;
    user.email = email;

    user.save().then(response => res.json(response));
});

module.exports = router;
