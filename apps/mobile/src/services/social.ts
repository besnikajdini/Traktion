import type {
  CreateWorkoutPostInput,
  PublicUserProfile,
  ReactionType,
  UserSearchResult,
  WorkoutPost,
  WorkoutPostPage,
} from '@traktion/shared-types';
import { api } from './api';

export function getFeed(cursor?: string | null): Promise<WorkoutPostPage> {
  return api.get<WorkoutPostPage>(`/workout-posts/feed${cursor ? `?cursor=${cursor}` : ''}`);
}

export function shareWorkout(input: CreateWorkoutPostInput): Promise<WorkoutPost> {
  return api.post<WorkoutPost>('/workout-posts', input);
}

export function deleteWorkoutPost(id: string): Promise<void> {
  return api.delete(`/workout-posts/${id}`);
}

export function reactToPost(postId: string, type: ReactionType): Promise<WorkoutPost> {
  return api.post<WorkoutPost>(`/workout-posts/${postId}/reactions`, { type });
}

export function searchUsers(query: string): Promise<UserSearchResult[]> {
  return api.get<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(query)}`);
}

export function getUserProfile(userId: string): Promise<PublicUserProfile> {
  return api.get<PublicUserProfile>(`/users/${userId}/profile`);
}

export function getUserWorkoutPosts(userId: string, cursor?: string | null): Promise<WorkoutPostPage> {
  return api.get<WorkoutPostPage>(`/users/${userId}/workout-posts${cursor ? `?cursor=${cursor}` : ''}`);
}

export function followUser(userId: string): Promise<void> {
  return api.post(`/users/${userId}/follow`);
}

export function unfollowUser(userId: string): Promise<void> {
  return api.delete(`/users/${userId}/follow`);
}
