const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'iiitnr_club_portal',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

const Club = require('./club.model')(sequelize, Sequelize.DataTypes);
const Event = require('./event.model')(sequelize, Sequelize.DataTypes);
const Membership = require('./membership.model')(sequelize, Sequelize.DataTypes);
const Conversation = require('./conversation.model')(sequelize, Sequelize.DataTypes);
const Message = require('./message.model')(sequelize, Sequelize.DataTypes);
const HealthAssessment = require('./healthAssessment.model')(sequelize, Sequelize.DataTypes);

// Define associations
Club.hasMany(Event, { foreignKey: 'clubId', as: 'events' });
Event.belongsTo(Club, { foreignKey: 'clubId', as: 'club' });

Club.hasMany(Membership, { foreignKey: 'clubId', as: 'memberships' });
Membership.belongsTo(Club, { foreignKey: 'clubId', as: 'club' });

// Chatbot associations
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

Conversation.hasOne(HealthAssessment, { foreignKey: 'conversationId', as: 'assessment' });
HealthAssessment.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

module.exports = {
  sequelize,
  Club,
  Event,
  Membership,
  Conversation,
  Message,
  HealthAssessment
};
