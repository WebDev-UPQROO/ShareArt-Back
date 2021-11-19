const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const CategorySchema = new Schema({
    name: String,
    icon: String,
    tags: [String]
});

const category = model('category', CategorySchema,'category')
module.exports = category;
