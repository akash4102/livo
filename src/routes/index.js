const Router = require("@koa/router");

const statusRoutes = require('./status');
const authRoutes = require('./auth');
const hotelRoutes = require('./hotel');
const bookingRoutes = require('./booking');
const roomRoutes = require('./room');

let r = new Router();

r.use('/api/v1', statusRoutes.routes(), statusRoutes.allowedMethods());
r.use('/api/v1', authRoutes.routes(), authRoutes.allowedMethods());
r.use('/api/v1', hotelRoutes.routes(), hotelRoutes.allowedMethods());
r.use('/api/v1', bookingRoutes.routes(), bookingRoutes.allowedMethods());
r.use('/api/v1', roomRoutes.routes(), roomRoutes.allowedMethods());

module.exports = { r } 