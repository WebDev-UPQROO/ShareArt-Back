const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const CommentSchema = new Schema({
    post: {type: mongoose.Types.ObjectId, ref: 'post'},
    user: {type: mongoose.Types.ObjectId, ref: 'user'},
    comments: {type: [mongoose.Types.ObjectId], ref: 'comment'},
    comment: String,
    date: String,
    votes: [{
        idUser: {type: mongoose.Types.ObjectId, ref: 'user'},
        action: Number,
        _id: false
    }]
});

const comment = model('comment', CommentSchema,'comment')
module.exports = comment;
