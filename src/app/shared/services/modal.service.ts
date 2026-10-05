import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private isShowedSubject = new BehaviorSubject<boolean>(false);
  public isShowed$ = this.isShowedSubject.asObservable();
  private selectedServiceSubject = new BehaviorSubject<string>('');
  public selectedService$ = this.selectedServiceSubject.asObservable();

  constructor() { }

  open(serviceName?: string): void {
    if (serviceName) {
      this.selectedServiceSubject.next(serviceName);
    } else {
      this.selectedServiceSubject.next('');
    }
    this.isShowedSubject.next(true);
  }

  close(): void {
    this.isShowedSubject.next(false);
  }
}
