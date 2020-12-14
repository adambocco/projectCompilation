
const async = require('async')
const State = require('./models/state')



const mongoose = require('mongoose');
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const states = []


function stateCreate(shortName, longName, covidDeath, governor, governorParty, cb) {
  stateDetail = {shortName:shortName,
                longName:longName, 
                covidDeath:covidDeath,
                governor:governor, 
                governorParty:governorParty};
  let newState = new State(stateDetail);
  newState.save((err)=> {
    if (err) {
      console.log(err);
      cb(err, null);
      return;
    }
    states.push(newState)
    cb(null, newState)
  })
}


function createStates(cb) {
    async.series([
        function(callback) {
          stateCreate('CT', 'Connecticut', '1,500', "Ned Lamont", "D", callback);
        },
        function(callback) {
          stateCreate('CA', 'California', '8,000', 'Arnold Schwaertezeneger?', 'D', callback);
        },
        ],
        // optional callback
        cb);
}

async.series([
    createStates
    // Add more table to auto-generate here
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('State Entries: '+states);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



