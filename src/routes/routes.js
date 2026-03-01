const express = require('express');
const routes = express.Router();
const HelloController = require('../controllers/HelloController');
const ClientController = require('../controllers/ClientController');

routes.get('/api/ola', HelloController.sayHello);
routes.post('/api/client', ClientController.register);

module.exports = routes;