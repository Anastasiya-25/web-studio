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
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserReaction} from "../../../../types/userReaction.type";

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
  userReaction: UserReaction[] = [];
  allCommentsCount: number = 0;
  isLogged: boolean = false;
  commentForm = this.fb.group({
    comment: ['', Validators.required],
  });


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
            this.loadInitialReactionsAndComments();
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
        const rawComments = data.comments.slice(0, 3);
        const reactionsMap = new Map(
          this.userReaction.map(item => [item.comment, item.action])
        );
        this.comments = rawComments.map(comment => ({
          ...comment,
          date: this.formatCommentDate(comment.date),
          userReaction: reactionsMap.get(comment.id) || null
        }));
      },
      error: (err) => console.error('Ошибка загрузки комментариев:', err)
    });
  }

  showMoreComments(): void {
    const offset: number = this.comments.length;
    this.commentService.getComments(offset, this.article.id).subscribe({
      next: (data) => {
        const rawComments = data.comments.slice(0, 10);

        const reactionsMap = new Map(
          this.userReaction.map(item => [item.comment, item.action])
        );
        const newComments = rawComments.map((comment: CommentType) => ({
          ...comment,
          date: this.formatCommentDate(comment.date),
          userReaction: reactionsMap.get(comment.id) || null
        }));

        this.comments = [...this.comments, ...newComments];
      },
      error: (err) => console.error('Ошибка подгрузки комментариев:', err)
    });
  }

  private formatCommentDate(date: string): string {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(date)).replace(',', '');
  }

  loadInitialReactions(): void {
    this.commentService.getCommentsActions(this.article.id)
      .subscribe({
        next: (data: UserReaction[] | DefaultResponseType) => {
          if ('error' in data && data.error) {
            this._snackBar.open(data.message);
            return;
          }
          this.userReaction = data as UserReaction[];
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message) {
            this._snackBar.open(errorResponse.error.message);
          } else {
            this._snackBar.open('Ошибка загрузки реакций');
            console.log(errorResponse);
          }
        }
      });
  }

  addComment() {
    if (this.commentForm.valid && this.commentForm.value.comment) {

      const paramsObject: AddCommentType = {
        article: this.article.id,
        text: this.commentForm.value.comment
      }

      this.commentService.addComments(paramsObject)
        .subscribe({
          next: (data: AddCommentType | DefaultResponseType) => {
            const error: boolean = (data as DefaultResponseType).error;

            if (error) {
              this._snackBar.open((data as DefaultResponseType).message);
              return;
            }
            this.commentForm.reset();
            this.loadInitialComments();
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

  onLike(id: string) {
    this.commentService.applyReaction(id, 'like')
    .subscribe({
      next: (data) => {
        if (data.error) {
          this._snackBar.open(data.message);
          return;
        } else if (!data.error) {
          this._snackBar.open('Ваш голос учтен!');
          this.comments = this.comments.map(comment => {
            if (comment.id !== id) {
              return comment;
            }
            const updatedComment = {...comment};

            if (updatedComment.userReaction === 'like') {
              updatedComment.userReaction = null;
              updatedComment.likesCount--;
            } else if (updatedComment.userReaction === 'dislike') {
              updatedComment.userReaction = 'like';
              updatedComment.dislikesCount--;
              updatedComment.likesCount++;
            } else {
              updatedComment.userReaction = 'like';
              updatedComment.likesCount++;
            }
            return updatedComment;
          });
        }
      },
      error: (err) => {
        const serverMessage = err?.error?.message || err?.message || '';
        let message = 'Ошибка отправки реакции';
        if (
          serverMessage.toLowerCase().includes('No auth token') || err.status === 401
        ) {
          message = 'Необходима авторизация';
        } else if (serverMessage) {
          message = serverMessage;
        }
        this._snackBar.open(message);
        console.error(err);
      }
    })
  }

  onDislike(id: string) {
    this.commentService.applyReaction(id, 'dislike')
      .subscribe({
        next: (data) => {
          if (data.error) {
            this._snackBar.open(data.message);
            return;
          } else if (!data.error) {
            this._snackBar.open('Ваш голос учтен!');
            this.comments = this.comments.map(comment => {
              if (comment.id !== id) {
                return comment;
              }
              const updatedComment = {...comment};

              if (updatedComment.userReaction === 'dislike') {
                updatedComment.userReaction = null;
                updatedComment.dislikesCount--;
              } else if (updatedComment.userReaction === 'like') {
                updatedComment.userReaction = 'dislike';
                updatedComment.dislikesCount++;
                updatedComment.likesCount--;
              } else {
                updatedComment.userReaction = 'dislike';
                updatedComment.dislikesCount++;
              }
              return updatedComment;
            });
          }
        },
        error: (err) => {
          const serverMessage = err?.error?.message || err?.message || '';
          let message = 'Ошибка отправки реакции';
          if (
            serverMessage.toLowerCase().includes('No auth token') || err.status === 401
          ) {
            message = 'Необходима авторизация';
          } else if (serverMessage) {
            message = serverMessage;
          }
          this._snackBar.open(message);
          console.error(err);
        }
      })
  }

  loadInitialReactionsAndComments(): void {
    this.commentService.getCommentsActions(this.article.id).subscribe({
      next: (reactionData) => {
        if ('error' in reactionData && reactionData.error) {
          console.error(reactionData.message);
          this.loadInitialComments();
          return;
        }
        this.userReaction = reactionData as UserReaction[];
        this.loadInitialComments();
      },
      error: (err) => {
        console.error('Ошибка загрузки реакций:', err);
        this.loadInitialComments();
      }
    });
  }

  onViolateClick(id: string) {
    this.commentService.applyReaction(id, 'violate')
      .subscribe({
        next: (data) => {
          if (data.error) {
            this._snackBar.open(data.message);
            return;
          } else if (!data.error) {
            this._snackBar.open('Жалоба отправлена!');

          }
        },
        error: (err) => {
          const serverMessage = err?.error?.message || err?.message || '';
          let message = 'Ошибка отправки реакции';
          if (
            serverMessage.toLowerCase().includes('No auth token') || err.status === 401
          ) {
            message = 'Необходима авторизация';
          } else if (serverMessage) {
            message = serverMessage;
          }
          this._snackBar.open(message);
          console.error(err);
        }
      })
  }
}
