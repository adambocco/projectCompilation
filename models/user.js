const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const UserSchema = mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  });
  
  // export model user with UserSchema
  module.exports = mongoose.model("user", UserSchema);