import { Router } from 'express';
import * as workoutPlansController from '../controllers/workoutPlans.controller';

export const workoutPlansRouter = Router();

workoutPlansRouter.get('/', workoutPlansController.list);
workoutPlansRouter.post('/', workoutPlansController.create);
workoutPlansRouter.get('/:id', workoutPlansController.getById);
workoutPlansRouter.put('/:id', workoutPlansController.update);
workoutPlansRouter.delete('/:id', workoutPlansController.remove);
