const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const GroupSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    admin: {type: mongoose.Types.ObjectId, ref: 'user'},
    categories: {type: [mongoose.Types.ObjectId], ref: 'category'},
    tags: [String],
    photo: String,
    name: Date,
    info: String,
    totalUsers: Number
});

const group = model('group', GroupSchema,'group')
module.exports = group;
