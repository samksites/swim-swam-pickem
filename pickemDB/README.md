# Environment Configuration

This directory contains environment configuration files for the Swim-Swam Pick'em application.

## Files

- `.env.example` - Template file with all available environment variables
- `.env` - Your local development environment configuration (git-ignored)
- `.gitignore` - Ensures sensitive files are not committed to version control

## Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the values in `.env`:**
   - Set your database credentials
   - Update JWT secrets with secure random strings
   - Configure email settings if needed
   - Adjust other settings as needed for your environment

## Key Configuration Sections

### Database
- **DB_HOST, DB_PORT, DB_NAME**: PostgreSQL connection details
- **DB_USER, DB_PASSWORD**: Database credentials
- **DB_POOL_***: Connection pooling settings

### Authentication
- **JWT_SECRET**: Secret key for JWT token signing (keep this secure!)
- **BCRYPT_SALT_ROUNDS**: Password hashing strength (12 is recommended)

### Competition Settings
- **DEFAULT_PICK_POINTS_***: Point values for correct picks by position
- **PERFECT_PICK_BONUS**: Extra points for getting all 4 positions correct

### Development
- **DEBUG**: Enable debug logging
- **SEED_DATABASE**: Automatically seed database with sample data
- **ENABLE_SWAGGER**: Enable API documentation

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` files to version control**
2. **Use strong, unique values for all secrets in production**
3. **Rotate secrets regularly in production environments**
4. **Use environment-specific configurations for different deployments**

## Environment-Specific Setup

### Development
- Use the provided `.env` file with development-friendly settings
- Enable debug mode and API documentation
- Use local database and services

### Production
- Create a separate `.env.production` file
- Use strong, unique secrets
- Configure proper SMTP settings
- Set up backup and monitoring
- Disable debug features

## Database Setup

Before running the application, make sure to:

1. **Create the database:**
   ```sql
   CREATE DATABASE "swimSwamPickem";
   ```

2. **Run the schema:**
   ```bash
   psql -d swimSwamPickem -f improved_schema.sql
   ```

3. **Load sample data (optional):**
   ```bash
   psql -d swimSwamPickem -f sample_data.sql
   ```

## Example Usage in Code

```javascript
// Load environment variables
require('dotenv').config();

// Use in your application
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 3000;
```

## Troubleshooting

- **Database connection fails**: Check DB_* variables and ensure PostgreSQL is running
- **JWT errors**: Ensure JWT_SECRET is set and consistent across restarts
- **CORS issues**: Check CORS_ORIGIN matches your frontend URL
- **Email not sending**: Verify SMTP_* settings and credentials
