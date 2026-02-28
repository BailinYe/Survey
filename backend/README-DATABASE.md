# Database Configuration Guide

## Development Environment Setup

### Option 1: Local MongoDB (Recommended for Development)

Each developer installs MongoDB locally:

```bash
# Install MongoDB (Windows)
# Download installer: https://www.mongodb.com/try/download/community

# Start MongoDB service
mongod

# .env configuration
MONGODB_URI=mongodb://localhost:27017/survey_dev
```

**Advantages:**

- Work completely offline
- Fastest performance
- Full control over data

### Option 2: MongoDB Atlas Personal Free Database

Each developer creates their own free Atlas cluster:

1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (512MB)
3. Create database user
4. Get connection string

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/survey_dev
```

**Advantages:**

- No local installation required
- Cloud backup
- Easy to share test data

## Environment Separation Strategy

### Development Environment

- Each developer has independent database
- Database name: `survey_dev` or `survey_dev_<name>`
- Can freely modify and clear data

### Staging Environment

- Team shared testing database
- Database name: `survey_staging`
- Used for integration testing and QA

### Production Environment

- Live production database
- Database name: `survey_prod`
- Strict access control and backup policies

## Configuration File Examples

```bash
# Developer A's .env
MONGODB_URI=mongodb://localhost:27017/survey_dev
NODE_ENV=development

# Developer B's .env
MONGODB_URI=mongodb://localhost:27017/survey_dev
NODE_ENV=development

# Staging server's .env
MONGODB_URI=mongodb+srv://...../survey_staging
NODE_ENV=staging

# Production server's .env
MONGODB_URI=mongodb+srv://...../survey_prod
NODE_ENV=production
```

## Best Practices

1. **Never share development databases** - Avoid data conflicts
2. **Use .env files** - Don't commit to git
3. **Provide seed data scripts** - Easy to initialize test data quickly
4. **Regularly sync database schema** - Use migration tools
5. **Separate production configuration** - Strict access control

## Database Initialization

You can create a seed data script:

```bash
npm run seed
```

这样每个开发者都能快速获得一致的测试数据。
