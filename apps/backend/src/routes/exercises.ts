import { Router } from 'express';
import * as exercisesController from '../controllers/exercises.controller';

export const exercisesRouter = Router();

// Static paths must come before the /:id catch-all.
exercisesRouter.get('/', exercisesController.list);
exercisesRouter.get('/filters', exercisesController.getFilters);
exercisesRouter.get('/count', exercisesController.count);
exercisesRouter.get('/:id', exercisesController.getById);
exercisesRouter.get('/:id/progress', exercisesController.getProgress);
exercisesRouter.get('/:id/history', exercisesController.getHistory);
exercisesRouter.get('/:id/personal-records', exercisesController.getPersonalBests);
