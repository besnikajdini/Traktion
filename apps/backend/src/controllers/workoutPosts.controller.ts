import type { NextFunction, Request, Response } from 'express';
import { ReactionType } from '@prisma/client';
import * as workoutPostsService from '../services/workoutPosts.service';
import { WorkoutPostError } from '../services/workoutPosts.service';

function parsePagination(req: Request) {
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : null;
  const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : null;
  const limit = limitRaw !== null && Number.isFinite(limitRaw) ? limitRaw : null;
  return { cursor, limit };
}

export async function getFeed(req: Request, res: Response, next: NextFunction) {
  try {
    const { cursor, limit } = parsePagination(req);
    const page = await workoutPostsService.listFeed(req.userId, cursor, limit);
    res.json(page);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { workoutSessionId, photoUrl } = req.body as Record<string, unknown>;
    if (typeof workoutSessionId !== 'string') {
      res.status(400).json({ error: 'workoutSessionId is required' });
      return;
    }
    if (photoUrl !== undefined && photoUrl !== null && typeof photoUrl !== 'string') {
      res.status(400).json({ error: 'photoUrl must be a string' });
      return;
    }

    const post = await workoutPostsService.createWorkoutPost(req.userId, workoutSessionId, photoUrl as string | null | undefined);
    res.status(201).json(post);
  } catch (err) {
    if (err instanceof WorkoutPostError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await workoutPostsService.deleteWorkoutPost(req.userId, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function react(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.body as Record<string, unknown>;
    if (typeof type !== 'string' || !(type in ReactionType)) {
      res.status(400).json({ error: 'type must be one of FIRE, STRONG, CLAP, HEART' });
      return;
    }

    const post = await workoutPostsService.setReaction(req.userId, req.params.id, type as ReactionType);
    res.json(post);
  } catch (err) {
    if (err instanceof WorkoutPostError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
}
