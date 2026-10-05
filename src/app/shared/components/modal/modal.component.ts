import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {CategoryType} from "../../../../types/category.type";
import {CategoriesService} from "../../services/categories.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {ModalService} from "../../services/modal.service";
import {Subscription} from "rxjs";
import {RequestType} from "../../../../types/request.type";
import {OrderService} from "../../services/order.service";
import {OrderType} from "../../../../types/order.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {

  modalForm = this.fb.group({
    service: [''],
    name: ['', [Validators.required, Validators.pattern('^[А-ЯЁ][а-яё]*( [А-ЯЁ][а-яё]*)*$')]],
    phone: ['', [Validators.required, Validators.pattern('^\\d+$')]],
  });

  type: RequestType = RequestType.order;
  categories: CategoryType[] = [];
  services: string[] = [];
  private serviceSub!: Subscription;
  isSubmitted: boolean = false;
  isError: boolean = false;
  isOrder: boolean = true;

  constructor(private fb: FormBuilder, private categoriesService: CategoriesService, public modalService: ModalService,
              private orderService: OrderService, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.categoriesService.getCategories()
      .subscribe((data: DefaultResponseType | CategoryType[]) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.categories = data as CategoryType[];
        this.services = this.categories.map(item => item.name);
      });
    this.serviceSub = this.modalService.selectedService$
      .subscribe((selectedServiceName: string) => {
        this.modalForm.reset();
        this.isError = false;
        this.modalForm.reset();

        const serviceControl = this.modalForm.get('service');

        if (selectedServiceName) {
          this.isOrder = true;
          serviceControl?.setValidators([Validators.required]);
          this.modalForm.patchValue({
            service: selectedServiceName
          });
        }
        else {
          this.isOrder = false;
          serviceControl?.clearValidators();
        }
        serviceControl?.updateValueAndValidity();
      });
  }

  ngOnDestroy(): void {
    if (this.serviceSub) {
      this.serviceSub.unsubscribe();
    }
  }

  close() {
    this.modalService.close();
  }

  sendOrder() {
    this.isOrder = true;
    if (this.modalForm.valid && this.modalForm.value.service && this.modalForm.value.name && this.modalForm.value.phone) {
      const paramsObject: OrderType = {
        service: this.modalForm.value.service,
        name: this.modalForm.value.name,
        phone: this.modalForm.value.phone,
        type: RequestType.order
      }
      this.order(paramsObject);
    }
  }

  sendConsultation() {
    this.isOrder = false;
    if (this.modalForm.valid && this.modalForm.value.name && this.modalForm.value.phone) {
      const paramsObject: OrderType = {
        name: this.modalForm.value.name,
        phone: this.modalForm.value.phone,
        type: RequestType.consultation
      }
      this.order(paramsObject);
    }
  }

  order(params: OrderType) {
    this.orderService.sendOrder(params)
      .subscribe({
        next: (order: DefaultResponseType) => {
          this.isSubmitted = true;
          this.modalForm.reset();
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message) {
            this.isError = true;
            this._snackBar.open(errorResponse.error.message);
          }
        }
      })
  }

  closeModal(): void {
    this.modalService.close();
    this.isSubmitted = false;
    this.isError = false;
    this.modalForm.reset();
    this.modalService.open('');
    this.modalService.close();
  }

}
