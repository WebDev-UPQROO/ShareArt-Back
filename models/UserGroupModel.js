const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const UserGroupSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    user: {type: mongoose.Types.ObjectId, ref: 'user'},
    group: {type: mongoose.Types.ObjectId, ref: 'group'}
});

const user_group = model('user_group', UserGroupSchema,'user_group')
module.exports = user_group;
