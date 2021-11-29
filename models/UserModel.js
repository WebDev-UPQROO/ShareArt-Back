const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const UserSchema = new Schema({
    categories: {type: [mongoose.Types.ObjectId], ref: 'category'},
    name: String,
    username: String,
    photo: {
        id: String,
        url: String
    },
    cover: {
        id: String,
        url: String
    },
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
const user = model('user', UserSchema,'user')
module.exports = user;
