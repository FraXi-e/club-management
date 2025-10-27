module.exports = (sequelize, DataTypes) => {
  const Membership = sequelize.define('Membership', {
    userId: { type: DataTypes.STRING, allowNull: false },
    clubId: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: 'memberships' });
  return Membership;
};
