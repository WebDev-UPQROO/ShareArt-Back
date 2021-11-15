const express = require('express');
const router = express.Router();

const Posts = require("../models/PostModel")
const Users = require("../models/UserModel")
const Followers = require("../models/FollowerModel")
const Groups = require("../models/GroupModel")
const UsersGroup = require("../models/UserGroupModel")


router.get('/:id', async function (req, res) {
  const {id} = req.params
  await Groups.findOne({_id: id})
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
      post = await Posts.find({group: id})
          .sort({_id: -1})
          .limit(10);
    } else {
      post = await Posts.find({user: id})
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
    usersGroup = await UsersGroup.find({"group": id})
        .sort({_id: -1})
        .limit(10);
  else
    usersGroup = await UsersGroup.find({"group": id})
        .where("_id").lt(idGroup)
        .sort({_id: -1})
        .limit(10);

  usersGroup.forEach(relation => {
    users.push(Users.findOne(
        {_id: relation.idUser})
        .select('-categories')
        .then(user => user.set("idUsersGroup", relation._id, {strict: false})))
  })

  const members = await Promise.all(users);

  if (idUser == null)
    res.json(members);
  else {
    finalMembers = members.map(async follower => {
      await Followers.exists({user: idUser, followed: follower._id})
          .then(follow => follower.set("follow", follow, {strict: false}))

      return follower
    })
    const response = await Promise.all(finalMembers);
    res.json(response);
  }

});

module.exports = router;

