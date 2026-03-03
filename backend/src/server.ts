import express, { type Request, type Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// basic routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Survey API Server' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
