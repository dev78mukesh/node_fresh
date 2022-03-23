const express = require('express');
const Routes = require('./routes/index');
const router = express();
router.use('/user', Routes.UserRoutes);
router.use('/admin', Routes.AdminRoutes);
module.exports = router;
