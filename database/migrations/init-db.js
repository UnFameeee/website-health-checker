require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const db = require('../models');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
    console.log(`Database ${process.env.DB_NAME} created or already exists.`);
    await connection.end();

    // Sync all models with database
    console.log('Syncing models with database...');
    await db.sequelize.sync({ force: true });
    console.log('All models were synchronized successfully.');

    // Create default settings
    console.log('Creating default settings...');
    await db.Setting.bulkCreate([
      {
        key: 'app_name',
        value: 'Website Health Monitor',
        description: 'Application name displayed in the UI'
      },
      {
        key: 'check_locations',
        value: JSON.stringify(['US East', 'US West', 'Europe', 'Asia']),
        description: 'Available locations for website checks'
      },
      {
        key: 'default_check_interval',
        value: '5',
        description: 'Default interval (in minutes) for website checks'
      },
      {
        key: 'default_timeout',
        value: '30',
        description: 'Default timeout (in seconds) for website checks'
      },
      {
        key: 'max_websites_per_user',
        value: '10',
        description: 'Maximum number of websites a regular user can monitor'
      },
      {
        key: 'retention_days',
        value: '90',
        description: 'Number of days to keep check history'
      }
    ]);
    console.log('Default settings created.');

    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

initializeDatabase(); 