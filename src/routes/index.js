const express = require('express');
const router = express.Router();

const clubs = require('./clubs.routes');
const events = require('./events.routes');
const memberships = require('./memberships.routes');
const chatbot = require('./chatbot.routes');

router.use('/clubs', clubs);
router.use('/events', events);
router.use('/memberships', memberships);
router.use('/chatbot', chatbot);

module.exports = router;
