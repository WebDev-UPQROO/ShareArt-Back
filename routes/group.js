const express = require('express');
const router = express.Router();
require('dotenv').config()

const Post = require("../models/PostModel")
const User = require("../models/UserModel")
const Follower = require("../models/FollowerModel")
const Group = require("../models/GroupModel")
const UserGroup = require("../models/UserGroupModel")

router.get('/:id', async function (req, res) {
  const {id} = req.params
  await Group.findOne({_id: id})
      .then(user => res.json(user))
      .catch(() => {
        res.status(404);
        res.json({"error": "Group not found"});
      })
});

router.put('/posts', async function (req, res) {
  const {id, idPost} = req.body;
  let post = [];
  try {
    if (idPost == null) {
      post = await Post.find({group: id})
          .sort({_id: -1})
          .limit(10);
    } else {
      post = await Post.find({user: id})
          .where('_id').lt(idPost)
          .sort({_id: -1})
          .limit(10);
    }
    res.json(post);
  }catch(err){
    res.status(500);
    res.json({"error": err});
  }
});

router.put('/members', async function (req, res) {
  const {id, idUser, idGroup, idUsersGroup} = req.body;
  let usersGroup;
  let users = [];
  let finalMembers = [];

  if (idUsersGroup == null)
    usersGroup = await UserGroup.find({"group": id})
        .sort({_id: -1})
        .limit(10);
  else
    usersGroup = await UserGroup.find({"group": id})
        .where("_id").lt(idGroup)
        .sort({_id: -1})
        .limit(10);

  usersGroup.forEach(relation => {
    users.push(User.findOne(
        {_id: relation.user})
        .select('-categories')
        .then(user => user.set("idUsersGroup", relation._id, {strict: false})))
  })

  const members = await Promise.all(users);

  if (idUser == null)
    res.json(members);
  else {
    finalMembers = members.map(async follower => {
      await Follower.exists({user: idUser, followed: follower._id})
          .then(follow => follower.set("follow", follow, {strict: false}))

      return follower
    })
    const response = await Promise.all(finalMembers);
    res.json(response);
  }

});

module.exports = router;

