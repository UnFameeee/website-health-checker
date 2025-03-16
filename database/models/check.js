'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Check extends Model {
    static associate(models) {
      // Define associations here
      Check.belongsTo(models.Website, {
        foreignKey: 'website_id',
        as: 'website'
      });
    }
  }

  Check.init({
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
    status: {
      type: DataTypes.ENUM('up', 'down'),
      allowNull: false
    },
    response_time: {
      type: DataTypes.INTEGER, // in milliseconds
      allowNull: true
    },
    status_code: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    check_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    location: {
      type: DataTypes.STRING,
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
    modelName: 'Check',
    tableName: 'check'
  });

  return Check;
}; 