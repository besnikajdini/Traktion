import { Router } from 'express';
import * as favoriteMealsController from '../controllers/favoriteMeals.controller';

export const favoriteMealsRouter = Router();

favoriteMealsRouter.get('/', favoriteMealsController.list);
favoriteMealsRouter.post('/', favoriteMealsController.create);
favoriteMealsRouter.post('/:id/log', favoriteMealsController.log);
favoriteMealsRouter.delete('/:id', favoriteMealsController.remove);
