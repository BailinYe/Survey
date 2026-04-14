# SurveyNest - GitPushPray team

## Contributors

| Name                | Student ID |
| ------------------- | ---------- |
| Carlos Gonzalez       | 40204811   |
| Fouad Meida         | 40249310   |
| Noemie Corneillier      | 40284815   |
| Bailin Ye        | 40192743   |
| Maesha Mahmud        | 40281586   |

## Project Overview

SurveyNest is a full-stack survey management application. Authenticated users can create, publish, and analyze surveys from an admin dashboard. Published surveys are accessible via a shareable public link — no login required for respondents. Results are aggregated in real-time on a per-survey analytics page.

## Deployed Application using Google Cloud Run

[SurveyNest](https://survey-dfe77.web.app) - Release v.1




## App Preview

<table>
  <tr>
    <td><img src="./docs/home.png" width="500"></td>
    <td><img src="./docs/login.png" width=500"></td>
  </tr>
  <tr>
    <td><img src="./docs/signup.png" width="500"></td>
    <td><img src="./docs/admin-dashboard.png" width="500"></td>
  </tr>
  <tr>
    <td><img src="./docs/new-survey.png" width="500"></td>
    <td><img src="./docs/publish-survey.png" width="500"></td>
  </tr>
  <tr>
    <td><img src="./docs/survey-analytics.png" width="500"></td>
    <td><img src="./docs/survey-respond.png" width="500"></td>
  </tr>
</table>


## Project Structure

```
Survey/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── config.ts
│   ├── index.ts
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
├── docs/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── surveys.ts
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── survey-results/
│   │   │   ├── ui/
│   │   │   ├── utils/
│   │   │   ├── PopupWindow.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── PublishSurveyPopup.tsx
│   │   ├── context/
│   │   ├── css/
│   │   │   ├── App.css
│   │   │   └── index.css
│   │   ├── firebase/
│   │   ├── lib/
│   │   ├── mocks/
│   │   ├── pages/
│   │   │   ├── CreateSurvey/
│   │   │   ├── RespondSurvey/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── OTPVerification.tsx
│   │   │   ├── PageNotFound.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── SurveyAnalytics.tsx
│   │   │   └── SurveySubmitted.tsx
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── shared/
│   ├── src/
│       ├── models/
│       │   ├── dtos/
│       │       ├── enums/
│       │       │   ├── QuestionType.ts
│       │       │   └── SurveyStatus.ts
│       │       ├── types/
│       │       │   ├── QuestionDTO.ts
│       │       │   ├── ResponseDTO.ts
│       │       │   └── SurveyDTO.ts
│       │       ├── utils/
│       │       │   └── validateResponse.ts
│       │       └── index.ts
│       └── index.ts
├── LICENSE
└── README.md

```

## Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- firebase-admin (Auth token verification + Firestore)
- Nodemailer (SMTP email — OTP and survey invites)
- tsx (development runtime)

### Frontend
- React 19
- Vite 7
- TypeScript
- React Router 7
- Firebase (client-side auth)
- Tailwind CSS 4
- shadcn/ui + Radix UI
- Lucide React

  
### Shared
- TypeScript DTOs shared between frontend and backend via the `shared/` package

## Getting Started

**Note:** This section is no longer valid anymore. It's kept for reference only, since it was mainly used for running the web app locally during development and while building new features before deployment.

### Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Development Mode

**Start backend server:**

```bash
cd backend
npm run dev
```

Server runs on http://localhost:3000 by default

**Start frontend server:**

```bash
cd frontend
npm run dev
```

Server runs on http://localhost:5173 by default

### Production Build

**Build backend:**

```bash
cd backend
npm run build
npm start
```

**Build frontend:**

```bash
cd frontend
npm run build
```

## Development Guide

1. Install dependencies after cloning the repository
2. Backend and frontend need to be started separately
3. Ensure backend service is started first
4. Make sure type checking passes before committing code
5. The frontend uses Tailwind CSS and shadcn/ui for styling and reusable UI components
6. Shared theme variables are defined in `frontend/src/index.css`
7. Prefer Lucide icons for consistent icon usage
8. Reuse shared DTOs from the root `shared/` directory to maintain consistency between frontend and backend

## Shared DTOs

- We use a shared TypeScript DTO contract in the root `shared/` directory to maintain consistency between frontend and backend.

<img src="docs/shared-dtos-new.jpg" width="1000">

### Enums
- `QuestionType` → `MultipleChoice` | `CheckBox` | `ShortAnswer` | `Rating`
- `SurveyStatus` → `New` | `Active` | `Closed`

### DTOs
- `SurveyDTO` → stores survey-level metadata such as id, author, title, description, status, timestamps, and question count

- `QuestionBaseDTO` → defines the common structure shared by all question types

- `QuestionDTO` → discriminated union of all supported question DTOs
    - `MultipleChoiceDTO` 
    - `CheckBoxDTO` 
    - `ShortAnswerDTO`
    - `RatingDTO`

- `ResponseDTO` → stores one submitted survey response for a specific survey
    - `surveyId`
    - `submittedAt`
    - `answers: Record<string, AnswerValue>` where each key is the `questionId`

- `AnswerValue` → typed answer union matched to each question type
    - `MultipleChoice` → `string`
    - `CheckBox` → `string[]`
    - `ShortAnswer` → `string`
    - `Rating` → `number`


## Routes

The app uses React Router with two access tiers. The entire app is wrapped in AuthProvider (Firebase onAuthStateChanged) so any route can call useAuth(). Protected routes are wrapped in ProtectedRoute, which redirects to /auth/login if there is no active session.

### Public routes
No login required

<img src="./docs/public-routes.png" width="800">


### Protected routes
Require an active Firebase session. Redirect to /auth/login otherwise.

All nested under AdminLayout (shared sidebar + navbar via <Outlet>).

<img src="./docs/protected-routes.png" width="800">

## License

ISC
