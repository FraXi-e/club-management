const { Club, Membership, Event } = require('../models');

exports.list = async (req, res) => {
  const clubs = await Club.findAll({ order: [['createdAt', 'DESC']] });
  res.json(clubs);
};

exports.get = async (req, res) => {
  const club = await Club.findByPk(req.params.id);
  if (!club) return res.status(404).json({ error: 'Club not found' });
  // include members count and events
  const members = await Membership.count({ where: { clubId: club.id } });
  const events = await Event.findAll({ where: { clubId: club.id }, order: [['datetime','ASC']] });
  res.json({ ...club.toJSON(), membersCount: members, events });
};

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    const club = await Club.create(payload);
    res.status(201).json(club);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
