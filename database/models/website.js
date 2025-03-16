'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Website extends Model {
    static associate(models) {
      // Define associations here
      Website.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Website.hasMany(models.Check, {
        foreignKey: 'website_id',
        as: 'checks'
      });
      Website.hasMany(models.Alert, {
        foreignKey: 'website_id',
        as: 'alerts'
      });
    }
  }

  Website.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    check_interval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5, // 5 minutes by default
      validate: {
        min: 1,
        max: 60
      }
    },
    expected_status_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 200
    },
    timeout: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30, // 30 seconds timeout
      validate: {
        min: 5,
        max: 60
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    alert_threshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Alert after 1 failed check
      validate: {
        min: 1
      }
    },
    alert_email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    last_check_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_status: {
      type: DataTypes.ENUM('up', 'down', 'unknown'),
      defaultValue: 'unknown'
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
    modelName: 'Website',
    tableName: 'website'
  });

  return Website;
}; 