const axios = require('axios');

/**
 * Check a website's status
 * @param {Object} website - Website object with url and timeout
 * @param {String} location - Location from which the check is performed
 * @returns {Object} Check result
 */
const checkWebsite = async (website, location = 'Default') => {
  const startTime = Date.now();
  let status = 'down';
  let responseTime = null;
  let statusCode = null;
  let errorMessage = null;

  try {
    // Set timeout in milliseconds
    const timeout = (website.timeout || 30) * 1000;
    
    // Make request to the website
    const response = await axios.get(website.url, {
      timeout,
      validateStatus: () => true // Don't throw on any status code
    });

    // Calculate response time
    responseTime = Date.now() - startTime;
    statusCode = response.status;

    // Check if status code matches expected status code
    const expectedStatusCode = website.expected_status_code || 200;
    if (response.status === expectedStatusCode) {
      status = 'up';
    } else {
      status = 'down';
      errorMessage = `Expected status code ${expectedStatusCode}, got ${response.status}`;
    }
  } catch (error) {
    status = 'down';
    if (error.code === 'ECONNABORTED') {
      errorMessage = `Request timed out after ${website.timeout || 30} seconds`;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'DNS lookup failed';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused';
    } else {
      errorMessage = error.message || 'Unknown error';
    }
  }

  return {
    status,
    responseTime,
    statusCode,
    errorMessage,
    location,
    checkTime: new Date()
  };
};

/**
 * Calculate uptime percentage
 * @param {Array} checks - Array of check objects
 * @returns {Number} Uptime percentage
 */
const calculateUptime = (checks) => {
  if (!checks || checks.length === 0) {
    return 100; // No checks means no downtime
  }

  const totalChecks = checks.length;
  const upChecks = checks.filter(check => check.status === 'up').length;
  
  return (upChecks / totalChecks) * 100;
};

module.exports = {
  checkWebsite,
  calculateUptime
}; 