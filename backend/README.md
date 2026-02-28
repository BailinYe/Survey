# Survey Backend

Backend API for the Survey application, built with Express.js and Firebase Firestore.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm
- Firebase project with Firestore enabled

### Setup Instructions

1. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Get Firebase Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (or create a new one)
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file and save it as `serviceAccountKey.json` in the `backend/` directory

3. **Enable Firestore Database**
   - In Firebase Console, go to Firestore Database
   - Click "Create Database"
   - Select "Test Mode" for development
   - Choose a region (recommended: asia-east1 or asia-northeast1)

4. **Configure Environment Variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` if needed (default port is 3000)

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   Server will start at `http://localhost:3000`

## 📡 API Endpoints

### Health Check

```bash
GET /health
```

### Surveys

```bash
GET    /api/surveys      # Get all surveys
GET    /api/surveys/:id  # Get single survey
POST   /api/surveys      # Create survey
PUT    /api/surveys/:id  # Update survey
DELETE /api/surveys/:id  # Delete survey
```

### Responses

```bash
GET  /api/responses/survey/:surveyId  # Get all responses for a survey
GET  /api/responses/:id               # Get single response
POST /api/responses                   # Submit response
```

## 📚 Documentation

- [MIGRATION.md](MIGRATION.md) - Migration guide from MongoDB to Firestore
- [README-DATABASE.md](README-DATABASE.md) - Detailed API documentation and data structures

## 🔒 Security Notes

- ⚠️ **NEVER commit `serviceAccountKey.json`** - It's already in `.gitignore`
- ⚠️ **NEVER commit `.env` files** - Only `.env.example` should be committed
- 🔐 For production, configure [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Project Structure

```
backend/
├── src/
│   ├── db/
│   │   └── firestore.ts      # Firestore connection
│   ├── routes/
│   │   ├── surveys.ts        # Survey routes
│   │   └── responses.ts      # Response routes
│   ├── app.ts                # Express app setup
│   └── config.ts             # Configuration
├── index.ts                  # Entry point
├── .env.example              # Environment variables template
├── serviceAccountKey.json    # Firebase credentials (DO NOT COMMIT)
└── package.json
```

## 🐛 Troubleshooting

### Error: serviceAccountKey.json not found

- Make sure you downloaded the service account key from Firebase Console
- Rename it exactly to `serviceAccountKey.json`
- Place it in the `backend/` directory (same level as `package.json`)

### Error: Cloud Firestore API not enabled

- Visit the link provided in the error message
- Click "Enable" to activate Firestore API
- Wait 1-2 minutes for it to propagate

### Port already in use

- Change the `PORT` in `.env` file to a different port (e.g., 3001)
- Or kill the process using the port

## 📝 Testing

Example: Create a survey

```bash
curl -X POST http://localhost:3000/api/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Customer Feedback",
    "description": "Help us improve",
    "questions": [
      {
        "id": "q1",
        "type": "text",
        "question": "What can we improve?"
      }
    ]
  }'
```

## 📄 License

ISC
