var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StateSchema = new Schema(
  {
    shortName: {type: String, required: true, maxlength: 100},
    longName: {type: String, required: true, maxlength: 100},
    population : {type: Number, required: true},
    populationDensity : {type: Number, required: true},
    death: {type: Number, required: true},
    positive: {type: String, required: true, maxlength: 30},
    governor: {type: String, required:true, maxlength: 100},
    senator1: {type: String, required:true, maxlength: 100},
    senator2: {type: String, required:true, maxlength: 100},
    governorParty: {type:String, required:true, enum: ['D','R','I','Other'], default:'Other'},
    senator1Party: {type:String, required:true, enum: ['D','R','I','Other'], default:'Other'},
    senator2Party: {type:String, required:true, enum: ['D','R','I','Other'], default:'Other'},
    partyScore: {type:Number, required:true}
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