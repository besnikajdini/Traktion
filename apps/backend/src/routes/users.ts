import { Router } from 'express';
import * as usersController from '../controllers/users.controller';

export const usersRouter = Router();

usersRouter.get('/search', usersController.search);
usersRouter.get('/:id/profile', usersController.getProfile);
usersRouter.get('/:id/workout-posts', usersController.getPosts);
usersRouter.post('/:id/follow', usersController.follow);
usersRouter.delete('/:id/follow', usersController.unfollow);
