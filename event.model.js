module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    clubId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    datetime: { type: DataTypes.DATE, allowNull: false },
    rsvps: { type: DataTypes.JSON, defaultValue: [] }
  }, { tableName: 'events' });
  return Event;
};
