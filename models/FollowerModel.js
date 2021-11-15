const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const FollowerSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    user: {type: mongoose.Types.ObjectId, ref: 'user'},
    followed: {type: mongoose.Types.ObjectId, ref: 'user'}
});

const follower = model('follower', FollowerSchema,'follower')
module.exports = follower;
