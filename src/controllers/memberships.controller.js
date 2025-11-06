const { Membership } = require('../models');

exports.list = async (req, res) => {
  const ms = await Membership.findAll();
  res.json(ms);
};

exports.create = async (req, res) => {
  try {
    const { userId, clubId } = req.body;
    const exists = await Membership.findOne({ where: { userId, clubId } });
    if (exists) return res.status(409).json({ error: 'Already a member' });
    const m = await Membership.create({ userId, clubId });
    res.status(201).json(m);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.delete = async (req, res) => {
  const m = await Membership.findByPk(req.params.id);
  if (!m) return res.status(404).json({ error: 'Membership not found' });
  await m.destroy();
  res.json({ success: true });
};
