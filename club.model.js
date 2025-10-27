module.exports = (sequelize, DataTypes) => {
  const Club = sequelize.define('Club', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    ownerId: { type: DataTypes.STRING },
    logo: { type: DataTypes.STRING }
  }, { tableName: 'clubs' });
  return Club;
};
