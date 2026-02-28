# Firebase Firestore Configuration Guide

## Quick Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select existing project
3. Enter project name (e.g., "Survey App")
4. Follow the setup wizard

### Step 2: Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select a location (closest to your users)

### Step 3: Get Service Account Key

1. Go to Project Settings (gear icon) → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. **Rename it to `serviceAccountKey.json`**
5. **Place it in the `backend/` directory**

### Step 4: Start Development

```bash
npm run dev
```

## API Endpoints

### Surveys

#### Create Survey

```bash
POST /api/surveys
Content-Type: application/json

{
  "title": "Customer Satisfaction Survey",
  "description": "Help us improve our service",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "How satisfied are you?",
      "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"]
    }
  ]
}
```

#### Get All Surveys

```bash
GET /api/surveys
```

#### Get Single Survey

```bash
GET /api/surveys/:id
```

#### Update Survey

```bash
PUT /api/surveys/:id
Content-Type: application/json

{
  "title": "Updated Title"
}
```

#### Delete Survey

```bash
DELETE /api/surveys/:id
```

### Responses

#### Submit Response

```bash
POST /api/responses
Content-Type: application/json

{
  "surveyId": "survey123",
  "answers": {
    "q1": "Very Satisfied",
    "q2": "Great service!"
  },
  "respondentEmail": "user@example.com"
}
```

#### Get Survey Responses

```bash
GET /api/responses/survey/:surveyId
```

#### Get Single Response

```bash
GET /api/responses/:id
```

## Data Structure

### Survey Document

```typescript
{
  id: string,              // Auto-generated
  title: string,
  description: string,
  questions: Array<{
    id: string,
    type: string,
    question: string,
    options?: string[]
  }>,
  createdAt: Date,
  updatedAt: Date
}
```

### Response Document

```typescript
{
  id: string,              // Auto-generated
  surveyId: string,
  answers: Record<string, any>,
  respondentEmail?: string,
  submittedAt: Date
}
```

## Firestore vs MongoDB

| Feature       | Firestore                | MongoDB                     |
| ------------- | ------------------------ | --------------------------- |
| **Setup**     | Instant, no installation | Requires installation/Atlas |
| **Scaling**   | Automatic                | Manual configuration        |
| **Real-time** | Built-in                 | Requires extra setup        |
| **Pricing**   | Free tier: 1GB storage   | Free tier: 512MB            |
| **Query**     | Limited complex queries  | Powerful aggregation        |
| **Best For**  | Rapid development        | Complex queries             |

## Security Rules (Production)

For production, update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Surveys - anyone can read, only admin can write
    match /surveys/{surveyId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Responses - anyone can create, only admin can read
    match /responses/{responseId} {
      allow create: if true;
      allow read: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## Troubleshooting

### Error: serviceAccountKey.json not found

- Make sure you downloaded the key from Firebase Console
- Rename it exactly to `serviceAccountKey.json`
- Place it in the `backend/` directory (same level as `package.json`)

### Error: Permission denied

- Check Firestore security rules in Firebase Console
- For development, use "test mode"
- For production, set proper authentication rules

### Error: Cannot connect to Firestore

- Check your internet connection
- Verify the service account key is valid
- Ensure Firebase project is active

## Best Practices

1. **Never commit serviceAccountKey.json** - Already in `.gitignore`
2. **Use environment variables** - For sensitive data
3. **Implement validation** - Validate data before saving
4. **Add indexes** - For frequently queried fields
5. **Monitor usage** - Check Firebase Console for quota limits

## Development Tips

### Test Data

Use Firebase Console to manually add test data:

1. Go to Firestore Database
2. Start Collection → Name: "surveys"
3. Add Document with sample data

### Emulator (Advanced)

For offline development:

```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

Then update connection to use emulator in development.

这样每个开发者都能快速获得一致的测试数据。
