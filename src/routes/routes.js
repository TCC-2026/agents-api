const express = require('express');
const routes = express.Router();
const HelloController = require('../controllers/HelloController');
const ClientController = require('../controllers/ClientController');
const adminAuthMiddleware = require('../middlewares/adminAuthMiddleware');

routes.get('/api/ola', HelloController.sayHello);
routes.post('/api/client', adminAuthMiddleware, ClientController.register);

module.exports = routes;