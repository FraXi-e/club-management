const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/events.controller');

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.post('/:id/rsvp', ctrl.rsvpToggle);

module.exports = router;
