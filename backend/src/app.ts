import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import symptomsRouter from './routes/symptoms';
import usersRouter from './routes/users';

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/symptoms', symptomsRouter);

app.use(errorHandler);

export default app;
