import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ArticleType} from "../../../types/article.type";
import {environment} from "../../../environments/environment";
import {DefaultResponseType} from "../../../types/default-response.type";
import {CommentType} from "../../../types/comment.type";

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private http: HttpClient) { }

  getTopArticles(): Observable<DefaultResponseType | ArticleType[]> {
    return this.http.get<DefaultResponseType | ArticleType[]>(environment.api + 'articles/top');
  }

  getArticles(categories?: string[], page?: number): Observable<{totalCount: number, pages: number, items: ArticleType[]}> {
    let httpParams = new HttpParams();

    if (page && page > 1) {
      httpParams = httpParams.set('page', page.toString());
    }

    if (categories && categories.length > 0) {
      categories.forEach(category => {
        httpParams = httpParams.append('categories', category);
      });
    }
    return this.http.get<{totalCount: number, pages: number, items: ArticleType[]}>(environment.api + 'articles', { params: httpParams });
  }

  getArticle(url: string): Observable<ArticleType> {
    return this.http.get<ArticleType>(environment.api + 'articles/' + url);
  }

  getRelativeArticle(url: string): Observable<DefaultResponseType | ArticleType[]> {
    return this.http.get<DefaultResponseType | ArticleType[]>(environment.api + 'articles/related/' + url);
  }

}
