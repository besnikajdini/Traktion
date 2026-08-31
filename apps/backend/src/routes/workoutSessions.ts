import { Router } from 'express';
import * as workoutSessionsController from '../controllers/workoutSessions.controller';

export const workoutSessionsRouter = Router();

workoutSessionsRouter.get('/active', workoutSessionsController.getActive);
workoutSessionsRouter.post('/', workoutSessionsController.start);
workoutSessionsRouter.get('/:id', workoutSessionsController.getById);
workoutSessionsRouter.post('/:id/end', workoutSessionsController.end);
