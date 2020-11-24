var express = require('express');
var router = express.Router();

const stateController = require('../controllers/stateController')


router.get('/', function(req, res, next) {
  console.log("GETTING /")
  res.render('index', { title: 'Express' });
});

router.get('/loadStates', function(req, res, next) {
  console.log("GETTING LOAD STATES")
  stateController.state_list(req, res)
});

module.exports = router;
