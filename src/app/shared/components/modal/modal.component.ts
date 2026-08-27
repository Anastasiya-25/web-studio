import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  modalForm = this.fb.group({
    service: ['', Validators.required],
    name: ['', [Validators.required, Validators.pattern('^[А-ЯЁ][а-яё]*( [А-ЯЁ][а-яё]*)*$')]],
    phone: ['', [Validators.required, Validators.pattern('^\\d+$')]],
  });


  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
  }

  close() {

  }

  modal() {

  }

}
