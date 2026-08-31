import { Router } from 'express';
import * as setLogsController from '../controllers/setLogs.controller';

export const setLogsRouter = Router();

setLogsRouter.get('/last', setLogsController.getLast);
setLogsRouter.post('/', setLogsController.create);
setLogsRouter.delete('/:id', setLogsController.remove);
