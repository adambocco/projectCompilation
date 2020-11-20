var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StateSchema = new Schema(
  {
    shortName: {type: String, required: true, maxlength: 100},
    longName: {type: String, required: true, maxlength: 100},
    covidDeath: {type: String, required: true, maxlength: 30},
    governor: {type: String, required:true, maxlength: 100},
    governorParty: {type:String, required:true, enum: ['D','R','I','Other'], default:'Other'}
  }
);

// Virtual for author's full name
// StateSchema
// .virtual('shortName')
// .get(function () {
//   return this.shortName;
// });

// // Virtual for author's lifespan
// StateSchema
// .virtual('longName')
// .get(function () {
//     return this.longName;
// });

// Virtual for author's URL
StateSchema
.virtual('url')
.get(function () {
  return '/state/' + this._id;
});

//Export model
module.exports = mongoose.model('State', StateSchema);