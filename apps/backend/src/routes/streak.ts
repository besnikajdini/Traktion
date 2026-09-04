import { Router } from 'express';
import * as streakController from '../controllers/streak.controller';

export const streakRouter = Router();

streakRouter.get('/', streakController.get);
