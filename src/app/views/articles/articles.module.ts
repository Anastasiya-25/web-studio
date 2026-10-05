import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArticlesRoutingModule } from './articles-routing.module';
import { BlogComponent } from './blog/blog.component';
import { ArticleComponent } from './article/article.component';
import {SharedModule} from "../../shared/shared.module";


@NgModule({
  declarations: [
    BlogComponent,
    ArticleComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ArticlesRoutingModule
  ]
})
export class ArticlesModule { }
