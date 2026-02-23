const express = require('express');
const routes = express.Router();
const HelloController = require('./controllers/HelloController');

routes.get('/api/ola', HelloController.sayHello);

module.exports = routes;