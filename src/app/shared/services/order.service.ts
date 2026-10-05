import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {OrderType} from "../../../types/order.type";
import {Observable} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  sendOrder(params: OrderType): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'requests', params);
  }
}
