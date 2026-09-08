import type { NextFunction, Request, Response } from 'express';
import * as usersService from '../services/users.service';
import { UserError } from '../services/users.service';
import * as workoutPostsService from '../services/workoutPosts.service';

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (q.length === 0) {
      res.json([]);
      return;
    }
    const users = await usersService.searchUsers(req.userId, q);
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await usersService.getPublicProfile(req.userId, req.params.id);
    if (!profile) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function getPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : null;
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : null;
    const limit = limitRaw !== null && Number.isFinite(limitRaw) ? limitRaw : null;

    const page = await workoutPostsService.listUserPosts(req.userId, req.params.id, cursor, limit);
    res.json(page);
  } catch (err) {
    next(err);
  }
}

export async function follow(req: Request, res: Response, next: NextFunction) {
  try {
    await usersService.followUser(req.userId, req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof UserError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function unfollow(req: Request, res: Response, next: NextFunction) {
  try {
    await usersService.unfollowUser(req.userId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
