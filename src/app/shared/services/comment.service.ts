import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {CommentType} from "../../../types/comment.type";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";

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
}
