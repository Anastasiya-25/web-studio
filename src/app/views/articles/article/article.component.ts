import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ArticleType} from "../../../../types/article.type";
import {ArticlesService} from "../../../shared/services/articles.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {CommentType} from "../../../../types/comment.type";
import {CommentService} from "../../../shared/services/comment.service";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ArticleComponent implements OnInit {

  article!: ArticleType;
  relatedArticles: ArticleType[] = [];
  serverStaticPath = environment.serverStaticPath;
  formattedText: SafeHtml = '';
  comments: CommentType[] = [];
  allCommentsCount: number = 0;

  constructor(private activatedRoute: ActivatedRoute, private articlesService: ArticlesService, private sanitizer: DomSanitizer,
              private commentService: CommentService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.articlesService.getArticle(params['url'])
        .subscribe((data: ArticleType) => {
          this.article = data;
          if (this.article && this.article.text) {
            const parsedHtml = this.linkify(this.article.text);
            this.formattedText = this.sanitizer.bypassSecurityTrustHtml(parsedHtml);
          }
          if (this.article.id) {
            this.loadInitialComments();
          }
        });
      this.articlesService.getRelativeArticle(params['url'])
      .subscribe((relatedData: ArticleType[] | DefaultResponseType) => {
        if ((relatedData as DefaultResponseType).error !== undefined) {
          throw new Error((relatedData as DefaultResponseType).message);
        }
        this.relatedArticles = relatedData as ArticleType[];
      });
    });

  }

  private linkify(text: string): string {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  }

  loadInitialComments(): void {
    this.commentService.getComments(0, this.article.id).subscribe({
      next: (data) => {
        this.allCommentsCount = data.allCount;
        this.comments = data.comments;
      },
      error: (err) => console.error('Ошибка загрузки комментариев:', err)
    });
  }

  showMoreComments(): void {
    this.commentService.getComments(3, this.article.id).subscribe({
      next: (data) => {
        this.comments = [...this.comments, ...data.comments];
      },
      error: (err) => console.error('Ошибка подгрузки комментариев:', err)
    });
  }

}
