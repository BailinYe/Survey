# Survey Project

A survey application system with separated frontend and backend architecture.

## Project Structure

```
Survey/
├── backend/          # Backend service (Node.js + Express + TypeScript)
├── frontend/         # Frontend application (React + Vite + TypeScript)
└── README.md
```

## Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript
- tsx (Development runtime)

### Frontend

- React
- Vite
- TypeScript

## Getting Started

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

## API Endpoints

- `GET /` - Service information
- `GET /health` - Health check

## Development Guide

1. Install dependencies after cloning the repository
2. Backend and frontend need to be started separately
3. Ensure backend service is started first
4. Make sure type checking passes before committing code

## Shared DTOs

We use a shared TypeScript DTO contract to maintain consistency between front and backend

- **Enums**
    - `QuestionType` → `multipleChoice` | `checkBox` | `shortAnswer` | `rating`
    - `SurveyStatus` → `new` | `active` | `past`

- **DTOs**
    - `SurveyDTO` → metadata 
    - `QuestionDTO` → defines all unique data per question type
      
      - `MultipleChoiceDTO`
        
      - `CheckBoxDTO`

      - `ShortAnswerDTO`

      - `RatingDTO`
      
    - `ResponseDTO` → response payloads

## License

ISC
