const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/memberships.controller');

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.delete);

module.exports = router;
