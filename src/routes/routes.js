const express = require('express');
const routes = express.Router();
const HelloController = require('../controllers/HelloController');
const ClientController = require('../controllers/ClientController');
const clientMiddleware = require('../middlewares/clientMiddleware');

routes.get('/api/ola', HelloController.sayHello);
routes.post('/api/client', clientMiddleware, ClientController.register);

module.exports = routes;