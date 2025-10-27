const express = require('express');
const router = express.Router();

const clubs = require('./clubs.routes');
const events = require('./events.routes');
const memberships = require('./memberships.routes');

router.use('/clubs', clubs);
router.use('/events', events);
router.use('/memberships', memberships);

module.exports = router;
