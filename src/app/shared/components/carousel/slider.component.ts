import { Component, OnInit } from '@angular/core';
import {ModalService} from "../../services/modal.service";
import {CarouselConfig} from "ngx-bootstrap/carousel";

@Component({
  selector: 'slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  providers: [
    {
      provide: CarouselConfig,
      useValue: {
        isAnimated: true
      }
    }
  ]
})
export class SliderComponent implements OnInit {

  constructor(private modalService: ModalService) {
  }

  ngOnInit(): void {
  }

  openModal(service: string): void {
    this.modalService.open(service);
  }

}
