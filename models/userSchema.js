const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    firstName: String,
    lastName: String,
    UCOID: String,
    password: String,
    degree: String,
    phoneNumber: String,
    verified: false,
    verificationCode: String,
    isFaculty: false,
    isAdmin: false
});

module.exports = mongoose.model('ASUsers', userSchema);