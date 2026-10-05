import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ArticleCardComponent} from "./components/article-card/article-card.component";
import {RouterModule} from "@angular/router";
import { ModalComponent } from './components/modal/modal.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";



@NgModule({
  declarations: [ArticleCardComponent, ModalComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ArticleCardComponent,
    ModalComponent
  ]
})
export class SharedModule { }
