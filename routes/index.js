var express = require('express');
var router = express.Router();
const bodyParser = require("body-parser");

const stateController = require('../controllers/stateController')


router.get('/', function(req, res, next) {
  res.render('index', { title: 'API Map' });
});

router.get('/pathfinder', function(req, res, next) {
  res.render('pathfinder', { title: 'Pathfinder' });
});


module.exports = router;
