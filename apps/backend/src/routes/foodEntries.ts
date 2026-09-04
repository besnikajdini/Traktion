import { Router } from 'express';
import * as foodEntriesController from '../controllers/foodEntries.controller';

export const foodEntriesRouter = Router();

foodEntriesRouter.get('/', foodEntriesController.list);
foodEntriesRouter.get('/summary', foodEntriesController.getSummary);
foodEntriesRouter.post('/', foodEntriesController.create);
foodEntriesRouter.delete('/:id', foodEntriesController.remove);
