import { Router } from 'express';
import * as workoutPostsController from '../controllers/workoutPosts.controller';

export const workoutPostsRouter = Router();

workoutPostsRouter.get('/feed', workoutPostsController.getFeed);
workoutPostsRouter.post('/', workoutPostsController.create);
workoutPostsRouter.delete('/:id', workoutPostsController.remove);
workoutPostsRouter.post('/:id/reactions', workoutPostsController.react);
