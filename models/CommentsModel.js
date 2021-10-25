const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const CommentsSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    idPost: {type: mongoose.Types.ObjectId, ref: "posts"},
    idUser: {type: mongoose.Types.ObjectId, ref: "users"},
    comments: {type: [mongoose.Types.ObjectId], ref: "comments"},
    comment: String,
    date: String,
    votes: Number
});

const comments = model("comments", CommentsSchema)
module.exports = comments;
