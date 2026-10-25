import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ArticleCardComponent} from "./components/article-card/article-card.component";
import {RouterModule} from "@angular/router";
import { ModalComponent } from './components/modal/modal.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { LoaderComponent } from './components/loader/loader.component';



@NgModule({
  declarations: [ArticleCardComponent, ModalComponent, LoaderComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  exports: [
    ArticleCardComponent,
    ModalComponent
  ]
})
export class SharedModule { }
