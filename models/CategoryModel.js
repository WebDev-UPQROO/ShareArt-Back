const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const CategorySchema = new Schema({
    _id: mongoose.Types.ObjectId,
    name: String,
    icon: String,
    tags: [String]
});

const category = model('category', CategorySchema)
module.exports = category;
