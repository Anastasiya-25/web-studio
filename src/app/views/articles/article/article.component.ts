import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ArticleType} from "../../../../types/article.type";
import {ArticlesService} from "../../../shared/services/articles.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {AddCommentType, CommentType} from "../../../../types/comment.type";
import {CommentService} from "../../../shared/services/comment.service";
import {AuthService} from "../../../core/auth/auth.service";
import {FormBuilder, Validators} from "@angular/forms";
import {UserInfoType} from "../../../../types/user-info.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

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
  isLogged: boolean = false;
  commentForm = this.fb.group({
    comment: ['', Validators.required],
  });
  userName: string = '';

  constructor(private activatedRoute: ActivatedRoute, private articlesService: ArticlesService, private sanitizer: DomSanitizer,
              private commentService: CommentService, private authService: AuthService, private fb: FormBuilder, private router: Router,
              private _snackBar: MatSnackBar) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

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

  addComment() {
    if (this.commentForm.valid && this.commentForm.value.comment) {
      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now).replace(',', '');

      if (this.isLogged) {
        this.authService.getUserInfo()
          .subscribe({
            next: (data: UserInfoType | DefaultResponseType) => {
              if ((data as DefaultResponseType).error !== undefined) {
                console.error((data as DefaultResponseType).message);
                this.userName = '';
                return;
              }

              const userInfo = data as UserInfoType;
              this.userName = userInfo.name;
            },
            error: (error) => {
              console.error('Ошибка при получении данных пользователя:', error);
              this.userName = '';
              this.authService.removeTokens();
            }
          });
      } else {
        this.userName = '';
      }

      const paramsObject: AddCommentType = {
        id: this.article.id,
        text: this.commentForm.value.comment
      }

      this.commentService.addComments(paramsObject)
        .subscribe({
          next: (data: AddCommentType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }
            this.commentForm.reset();
            this.router.navigate(['/article/' + this.article.url]);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка добавления комментария');
              console.log(errorResponse.error.message);
            }
          }
        });
    }
  }

}
