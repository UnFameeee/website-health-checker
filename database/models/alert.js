'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Alert extends Model {
    static associate(models) {
      // Define associations here
      Alert.belongsTo(models.Website, {
        foreignKey: 'website_id',
        as: 'website'
      });
    }
  }

  Alert.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    website_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'website',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('down', 'up', 'slow_response'),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed'),
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    notification_method: {
      type: DataTypes.ENUM('email'),
      defaultValue: 'email'
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Alert',
    tableName: 'alert'
  });

  return Alert;
}; 