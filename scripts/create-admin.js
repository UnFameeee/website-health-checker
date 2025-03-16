require('dotenv').config();
const db = require('../database/models');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdminUser() {
  try {
    console.log('=== Create Admin User ===');
    
    // Get admin details
    const username = await askQuestion('Enter admin username: ');
    const email = await askQuestion('Enter admin email: ');
    const password = await askQuestion('Enter admin password: ');
    const fullName = await askQuestion('Enter admin full name: ');
    
    // Create admin user
    const admin = await db.User.create({
      id: uuidv4(),
      username,
      email,
      password, // Will be hashed by the model hook
      full_name: fullName,
      role: 'admin',
      is_active: true,
      timezone: 'UTC'
    });
    
    console.log(`\nAdmin user created successfully!`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Check if database connection is established
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    createAdminUser();
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  }); 