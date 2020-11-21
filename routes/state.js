// var express = require('express');
// var router = express.Router();

// // Require controller modules.
// var state_controller = require('../controllers/stateController');



// // GET catalog home page.
// router.get('/', state_controller.index);

// // GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
// router.get('/state/create', state_controller.state_create_get);

// // POST request for creating Book.
// router.post('/state/create', state_controller.state_create_post);

// // GET request to delete Book.
// router.get('/state/:id/delete', state_controller.state_delete_get);

// // POST request to delete Book.
// router.post('/state/:id/delete', state_controller.state_delete_post);

// // GET request to update Book.
// router.get('/state/:id/update', state_controller.state_update_get);

// // POST request to update Book.
// router.post('/state/:id/update', state_controller.state_update_post);

// // GET request for one Book.
// router.get('/state/:id', state_controller.state_detail);

// // GET request for list of all Book items.
// router.get('/states', state_controller.state_list);