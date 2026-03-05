import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

app.use(errorHandler);

export default app;
