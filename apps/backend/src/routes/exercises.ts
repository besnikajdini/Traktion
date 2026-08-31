import { Router } from 'express';
import * as exercisesController from '../controllers/exercises.controller';

export const exercisesRouter = Router();

exercisesRouter.get('/', exercisesController.list);
exercisesRouter.get('/:id', exercisesController.getById);
