const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const GroupsSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    idAdmin: {type: mongoose.Types.ObjectId, ref: "users"},
    idCategories: {type: [mongoose.Types.ObjectId], ref: "categories"},
    tags: [String],
    photo: String,
    name: Date,
    info: String,
    totalUsers: Number
});

const groups = model("groups", GroupsSchema)
module.exports = groups;
