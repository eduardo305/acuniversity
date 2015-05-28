// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user');

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Course', new Schema({ 
    name: String, 
    host: [String],
    description: String,
    topics: [String],
    startdate: {type: Date, default: Date.now},
    attendees: [{
    	type: Schema.Types.ObjectId,
    	ref: 'User'
    }]
}));