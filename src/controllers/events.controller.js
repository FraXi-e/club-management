const { Event } = require('../models');

exports.list = async (req, res) => {
  const events = await Event.findAll({ order: [['datetime','ASC']] });
  res.json(events);
};

exports.get = async (req, res) => {
  const ev = await Event.findByPk(req.params.id);
  if (!ev) return res.status(404).json({ error: 'Event not found' });
  res.json(ev);
};

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    const ev = await Event.create({ ...payload, datetime: new Date(payload.datetime) });
    res.status(201).json(ev);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.rsvpToggle = async (req, res) => {
  try {
    const ev = await Event.findByPk(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    const { userId } = req.body;
    const rsvps = ev.rsvps || [];
    const idx = rsvps.indexOf(userId);
    if (idx === -1) rsvps.push(userId); else rsvps.splice(idx,1);
    ev.rsvps = rsvps;
    await ev.save();
    res.json(ev);
  } catch (err) { res.status(400).json({ error: err.message }); }
};
