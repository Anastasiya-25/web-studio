import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {AddCommentType, CommentType} from "../../../types/comment.type";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {DefaultResponseType} from "../../../types/default-response.type";
import {UserReaction, UserReactionAction} from "../../../types/userReaction.type";


@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) { }

  getComments(offset: number, id: string): Observable<{allCount: number, comments: CommentType[]}> {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('article', id);

    return this.http.get<{ allCount: number, comments: CommentType[]}>(environment.api + 'comments', { params });
  }

  addComments(params: AddCommentType): Observable<AddCommentType | DefaultResponseType> {
    return this.http.post<AddCommentType | DefaultResponseType>(environment.api + 'comments', params);
  }

  getCommentsActions(articleId: string): Observable<UserReaction[] | DefaultResponseType> {
    const params = new HttpParams()
      .set('articleId', articleId);

    return this.http.get<UserReaction[] | DefaultResponseType>(environment.api + 'comments/article-comment-actions', { params });
  }

  applyReaction(id: string, action: UserReactionAction): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'comments/' + id + '/apply-action', { action });
  }
}
