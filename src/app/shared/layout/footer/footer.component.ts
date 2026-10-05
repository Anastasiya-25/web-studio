import { Component, OnInit } from '@angular/core';
import {ModalService} from "../../services/modal.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(private modalService: ModalService) { }

  ngOnInit(): void {
  }

  sendConsultation(): void {
    this.modalService.open();
  }

}
