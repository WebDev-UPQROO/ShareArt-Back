const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const UserSchema = new Schema({
    _id: mongoose.Types.ObjectId,
    categories: {type: [mongoose.Types.ObjectId], ref: 'category'},
    name: String,
    username: String,
    photo: String,
    bio: String,
    age: Number,
    email: String,
    password: String
});

UserSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
}
const user = model('user', UserSchema)
module.exports = user;
