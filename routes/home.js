const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const fs = require('fs-extra');

const cloudinary = require('../helpers/fileUpload');

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
        res.json({'error': 'Intentalo mas tarde'});
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
            res.json({'error': 'Algo salió mal :('});
        });
});
/* GET 10 Artists */
router.put('/artists', async function (req, res) {
    const {idUser, idArtist} = req.body;
    let artist;

    if(idArtist == null){
        artist = await User.find()
            .select('-categories')
            .sort({'_id': -1})
            .limit(10);
    }else {
        artist = await User.find()
            .select('-categories')
            .sort({'_id': -1})
            .where('_id').lt(idArtist)
            .limit(10);
    }

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

router.post('/post/create', async function (req, res) {
    const {id, title, description, categories} = req.body;
    const files = req.files;
    let images = [];
    const date = new Date();

    const newPost = new Post({"user": id, "categories":categories, "date":date,"title": title, "post": description});

    const post = await newPost.save().catch(err => console.log(err));
    for (const file of files) {
        const {path} = file;
        const newPath = await cloudinary.upload(path, 'shareart/users/' + id + '/posts/' + post._id, null)
        images.push(newPath)
        fs.removeSync(path);
    }
    post.images = images;

    await post.save().then(response => res.json(response));
});

router.put('/post/edit', async function (req, res){
    const {id, title, description, categories, idImages} = req.body;
    const files = req.files;

    const post = await Post.findOne({'_id': id});

    post.title = title;
    post.description = description;
    post.categories = categories;

    idImages.forEach(id => {
        for (let i = 0; i < post.images.length; i++) {
            if (post.images[i].id === id) {
                post.images.splice(i, 1);
                i--;
            }
        }
    });

    idImages.forEach(image => cloudinary.delete(image));

    for (const file of files) {
        const {path} = file;
        const newPath = await cloudinary.upload(path, 'shareart/users/' + post.user + '/posts/' + post._id, null)
        post.images.push(newPath)
        fs.removeSync(path);
    }

    post.save().then(response => res.json(response))

});

router.post('/post/delete', async function (req, res) {
    const {idUser, idPost} = req.body;
    const post = await Post.findOne({'_id': idPost});
    if(post.user.toString() === idUser){
        await post.delete();
        post.images.forEach(image => cloudinary.delete(image.id));
        res.status(200)
        res.json({"message":"Todo bien"})
    }else{
        res.status(403);
        res.json({"error": "No puedes eliminar este post"});
    }

});

router.put('/post/vote', async function (req, res) {
    const {idUser, type, idPost} = req.body;
    const post = Post.find({})
});

router.put('/comment/create', async function (req, res){


});

router.post('/comment/delete', async function (req, res){


});

router.put('/comment/vote', async function (req, res){


});

router.put('/explore', async function (req, res){
    const {search, idPost} = req.body;
    const post = await Post.find({ $or: [{ title: search }, { description: search }, { age: 2 }] })
        .populate('user')
        .sort({'_id': -1})
        .limit(10);

});


module.exports = router;
