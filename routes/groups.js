var express = require('express');
var router = express.Router();

const Posts = require("../models/PostsModel")
const Users = require("../models/UsersModel")
const Followers = require("../models/FollowerModel")
const Groups = require("../models/GroupsModel")
const UsersGroup = require("../models/UsersGroupsModel")

router.get('/:id', async function (req, res) {
  await Groups.findOne({_id: req.params.id})
      .then(user => res.json(user))
      .catch(() => {
        res.status(404);
        res.json({"error": "Group not found"});
      })
});

router.put('/posts', async function (req, res) {
  let post = [];
  try {
    if (req.body.idPost == null) {
      post = await Posts.find({idGroup: req.body.id})
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

router.put('/members', async function (req, res) {
  let usersGroup;
  let users = [];
  let finalMembers = [];

  if (req.body.idUsersGroup == null)
    usersGroup = await UsersGroup.find({"idGroup": req.body.id})
        .sort({_id: -1})
        .limit(10);
  else
    usersGroup = await UsersGroup.find({"idGroup": req.body.id})
        .where("_id").lt(req.body.idGroup)
        .sort({_id: -1})
        .limit(10);

  usersGroup.forEach(relation => {
    users.push(Users.findOne(
        {_id: relation.idUser})
        .select('-password').select('-idCategories')
        .then(user => user.set("idUsersGroup", relation._id, {strict: false})))
  })

  const members = await Promise.all(users);

  if (req.body.idUser == null)
    res.json(members);
  else {
    finalMembers = members.map(async follower => {
      await Followers.exists({idUser: req.body.idUser, idFollowed: follower._id})
          .then(follow => follower.set("follow", follow, {strict: false}))

      return follower
    })
    const response = await Promise.all(finalMembers);
    res.json(response);
  }

});

module.exports = router;

