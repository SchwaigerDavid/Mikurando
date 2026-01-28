import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ForumThreadDto = {
  thread_id: number;
  restaurant_id: number;
  user_id: number;
  author_name?: string;
  author_surname?: string;
  title: string;
  created_at: string;
  is_closed: boolean;
};

export type ForumPostDto = {
  post_id: number;
  thread_id: number;
  user_id: number;
  author_name?: string;
  author_surname?: string;
  content: string;
  created_at: string;
  is_approved: boolean;
};

export type OwnerModerationPostDto = ForumPostDto & {
  restaurant_id: number;
  restaurant_name: string;
  thread_title: string;
};

@Injectable({ providedIn: 'root' })
export class ForumApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/forum';

  listThreadsForRestaurant(restaurantId: number): Observable<ForumThreadDto[]> {
    return this.http.get<ForumThreadDto[]>(`${this.baseUrl}/restaurants/${restaurantId}/threads`);
  }

  createThread(restaurantId: number, title: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/restaurants/${restaurantId}/threads`, { title });
  }

  listPostsForThread(threadId: number): Observable<ForumPostDto[]> {
    return this.http.get<ForumPostDto[]>(`${this.baseUrl}/threads/${threadId}/posts`);
  }

  createPost(threadId: number, content: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/threads/${threadId}/posts`, { content });
  }

  listOwnerModerationPosts(): Observable<OwnerModerationPostDto[]> {
    return this.http.get<OwnerModerationPostDto[]>(`${this.baseUrl}/owner/moderation/posts`);
  }

  deletePostAsOwner(postId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/posts/${postId}`);
  }
}
