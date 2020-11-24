const mongoose = require('mongoose');
const State = require('../models/state');
const mongoDB = 'mongodb+srv://adambocco:csc443@cluster0.mbyvv.mongodb.net/apimashup?retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

console.log(State)

// Display list of all Authors.
exports.state_list = function(req, res) {
    console.log("CONTROLLER CALLED")
    State.find({}, (err, states)=> {
        if (err) {console.log(err)}
        else {
            console.log("STATES: ", states)
            res.json(states);
        }
    })
};

// Display detail page for a specific Author.
exports.state_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
};

// Display Author create form on GET.
exports.state_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create GET');
};

// Handle Author create on POST.
exports.state_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create POST');
};

// Display Author delete form on GET.
exports.state_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete GET');
};

// Handle Author delete on POST.
exports.state_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display Author update form on GET.
exports.state_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.state_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};