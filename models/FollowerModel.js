const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const FollowersSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    idUser: {type: mongoose.Types.ObjectId, ref: "users"},
    idFollowed: {type: mongoose.Types.ObjectId, ref: "users"}
});

const followers = model("followers", FollowersSchema)
module.exports = followers;
