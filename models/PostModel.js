const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PostsSchema = new Schema({
    user: {type: mongoose.Types.ObjectId, ref: 'user'},
    categories: {type: [mongoose.Types.ObjectId], ref: 'category'},
    group: {type: mongoose.Types.ObjectId, ref: 'group'},
    postOrigin: {type: mongoose.Types.ObjectId, ref: 'post'},
    title: String,
    post: String,
    images: [{
        id: String,
        url: String,
        _id: false
    }],
    votes: [{
        idUser: {type: mongoose.Types.ObjectId, ref: 'user'},
        action: Number,
        _id: false
    }],
    comments: [String],
    date: Date
});

const post = model('post', PostsSchema,'post')
module.exports = post;
