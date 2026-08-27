import {Component, Input, OnInit} from '@angular/core';
import {ArticleType} from "../../../../types/article.type";
import {ArticlesService} from "../../services/articles.service";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss']
})
export class ArticleCardComponent implements OnInit {

  @Input() article!: ArticleType;
  serverStaticPath = environment.serverStaticPath;

  constructor(private articlesService: ArticlesService) { }

  ngOnInit(): void {
  }

}
