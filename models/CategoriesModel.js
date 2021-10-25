const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const CategoriesSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    name: String,
    icon: String,
    tags: [String]
});

const posts = model("categories", CategoriesSchema)
module.exports = posts;
