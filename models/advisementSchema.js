const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const advisementSchema = new Schema({
    id: String,
    user: String,
    title: String,
    image: String,
    description: String,
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
});

module.exports = mongoose.model('advisement', advisementSchema);