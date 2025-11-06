module.exports = (sequelize, DataTypes) => {
  const HealthAssessment = sequelize.define('HealthAssessment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'conversations',
        key: 'id'
      }
    },
    symptoms: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of symptoms mentioned'
    },
    potentialConditions: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of possible health conditions'
    },
    severityLevel: {
      type: DataTypes.ENUM('low', 'moderate', 'high', 'emergency'),
      allowNull: false
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Medical recommendations and next steps'
    },
    urgencyScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Score from 1-10 indicating urgency'
    },
    disclaimer: {
      type: DataTypes.TEXT,
      defaultValue: 'This assessment is for informational purposes only and does not constitute medical advice. Please consult a healthcare professional for proper diagnosis and treatment.'
    },
    generatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'health_assessments',
    timestamps: true
  });

  return HealthAssessment;
};
