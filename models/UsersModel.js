const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const UsersSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    idCategories: {type: [mongoose.Types.ObjectId], ref: "categories"},
    name: String,
    username: String,
    photo: String,
    info: String,
    age: Date,
    email: String,
    password: String
});

const users = model("users", UsersSchema)
module.exports = users;
