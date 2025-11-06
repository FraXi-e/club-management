module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Optional user identifier for tracking'
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'abandoned'),
      defaultValue: 'active'
    },
    initialSymptom: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'First symptom described by user'
    },
    messageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'conversations',
    timestamps: true
  });

  return Conversation;
};
