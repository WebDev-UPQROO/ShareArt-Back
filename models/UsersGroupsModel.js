const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const UsersGroupsSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    idUser: {type: mongoose.Types.ObjectId, ref: "users"},
    idGroup: {type: mongoose.Types.ObjectId, ref: "groups"}
});

const users_groups = model("users-groups", UsersGroupsSchema)
module.exports = users_groups;
