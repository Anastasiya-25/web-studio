import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CategoryType} from "../../../types/category.type";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {DefaultResponseType} from "../../../types/default-response.type";

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(private http: HttpClient) { }

  getCategories(): Observable<DefaultResponseType | CategoryType[]> {
    return this.http.get<DefaultResponseType | CategoryType[]>(environment.api + 'categories');
  }

}
