# Website Health Monitor

A comprehensive website monitoring application that allows you to track the uptime, response time, and overall health of your websites.

## Features

- **Real-time Monitoring**: Monitor your websites' uptime and performance in real-time
- **Detailed Reports**: Generate uptime and response time reports with visual charts
- **Customizable Alerts**: Receive email notifications when your websites go down
- **User Management**: Admin panel to manage users and their permissions
- **API Access**: RESTful API for programmatic access to monitoring data
- **Public Status Page**: Share your websites' status with your users

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Frontend**: EJS templates, Bootstrap 5, Chart.js
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/website-health-monitor.git
   cd website-health-monitor
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Server
   PORT=3000
   NODE_ENV=development

   # Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=website_health_monitor

   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d

   # Email (for alerts)
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   EMAIL_FROM=noreply@example.com
   ```

4. Initialize the database:
   ```
   npm run init-db
   ```

5. Create an admin user:
   ```
   npm run admin-script
   ```

6. Start the application:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

7. Access the application at `http://localhost:3000`

## Usage

### Adding a Website to Monitor

1. Log in to your account
2. Navigate to the "Websites" section
3. Click on "Add Website"
4. Fill in the website details:
   - Name: A descriptive name for the website
   - URL: The full URL to monitor (including https:// or http://)
   - Check Interval: How often the website should be checked
   - Expected Status Code: The HTTP status code that indicates the website is up
   - Timeout: Maximum time to wait for a response
   - Alert Settings: Configure when and how to receive alerts
5. Click "Add Website" to start monitoring

### Viewing Reports

1. Navigate to the "Reports" section
2. Select a website from the list
3. Choose the report type (Uptime or Response Time)
4. Select a time range (24h, 7d, 30d)
5. View the report or export it as CSV

## API Documentation

The API documentation is available at `/api-docs` when the application is running.

### Authentication

All API requests require authentication using a JWT token. To obtain a token:

```
POST /api/auth/login
{
  "email": "your_email@example.com",
  "password": "your_password"
}
```

Include the token in the Authorization header for subsequent requests:

```
Authorization: Bearer your_token_here
```

### Example Endpoints

- `GET /api/websites`: Get all websites
- `GET /api/websites/:id`: Get a specific website
- `POST /api/websites`: Create a new website
- `GET /api/websites/:id/checks`: Get checks for a website
- `GET /api/websites/:id/stats`: Get uptime stats for a website

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.