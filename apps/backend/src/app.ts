import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { exercisesRouter } from './routes/exercises';
import { workoutPlansRouter } from './routes/workoutPlans';
import { workoutSessionsRouter } from './routes/workoutSessions';
import { setLogsRouter } from './routes/setLogs';
import { streakRouter } from './routes/streak';
import { foodEntriesRouter } from './routes/foodEntries';
import { favoriteMealsRouter } from './routes/favoriteMeals';
import { requireAuth } from './middleware/requireAuth';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);

  app.use('/exercises', requireAuth, exercisesRouter);
  app.use('/workout-plans', requireAuth, workoutPlansRouter);
  app.use('/workout-sessions', requireAuth, workoutSessionsRouter);
  app.use('/set-logs', requireAuth, setLogsRouter);
  app.use('/streak', requireAuth, streakRouter);
  app.use('/food-entries', requireAuth, foodEntriesRouter);
  app.use('/favorite-meals', requireAuth, favoriteMealsRouter);

  app.use(errorHandler);

  return app;
}
