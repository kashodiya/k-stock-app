var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var symbolSchema = new Schema({
  name: String,
  dateUpdated: Date,
  data: []
});

var Symbol = mongoose.model('Symbol', symbolSchema);

// make this available to our users in our Node applications
module.exports = Symbol;