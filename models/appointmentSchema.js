const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    advisementID: String,
    email: String,
    date: String,
    time: String
});

module.exports = mongoose.model('appointment', appointmentSchema);