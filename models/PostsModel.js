const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PostsSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    idUser: {type: mongoose.Types.ObjectId, ref: "users"},
    idCategories: {type: mongoose.Types.ObjectId, ref: "categories"},
    idGroup: {type: mongoose.Types.ObjectId, ref: "groups"},
    idPostOrigin: {type: mongoose.Types.ObjectId, ref: "posts"},
    comments: {type: [mongoose.Types.ObjectId], ref: "comments"},
    title: String,
    post: String,
    photo: String,
    votes: String
});

const posts = model("posts", PostsSchema)
module.exports = posts;
