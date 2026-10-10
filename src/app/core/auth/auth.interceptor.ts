import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {BehaviorSubject, catchError, filter, finalize, Observable, switchMap, take, throwError} from "rxjs";
import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";
import {DefaultResponseType} from "../../../types/default-response.type";
import {LoginResponseType} from "../../../types/login-response.type";
import {Router} from "@angular/router";


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService, private router: Router,
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // this.loaderService.show();
    const tokens = this.authService.getTokens();
    let authReq = req;
    if (tokens && tokens.accessToken) {
      authReq = req.clone({
        headers: req.headers.set('x-auth', tokens.accessToken),
      });
    }
    return next.handle(authReq)
      .pipe(
        catchError((error) => {
          if (error.status === 401 && !authReq.url.includes('/login') && !authReq.url.includes('/refresh')) {
            return this.handle401(authReq, next);
          }
          return throwError(() => error);
        }),
        // finalize(() => this.loaderService.hide()),
      );

    // return next.handle(req).pipe(finalize(() => this.loaderService.hide()));
  }

  handle401(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refresh()
        .pipe(
          switchMap((result: DefaultResponseType | LoginResponseType) => {
            this.isRefreshing = false;
            let error = '';
            if ((result as DefaultResponseType).error !== undefined) {
              error = (result as DefaultResponseType).message;
            }
            const refreshResult = result as LoginResponseType;
            if (!refreshResult.accessToken && !refreshResult.refreshToken && !refreshResult.userId) {
              error = 'Ошибка авторизации';
            }
            if (error) {
              this.handleAuthFailure();
              return throwError(() => new Error(error));
            }
            this.authService.setTokens(refreshResult.accessToken, refreshResult.refreshToken);
            this.refreshTokenSubject.next(refreshResult.accessToken);
            const authReq = req.clone({
              headers: req.headers.set('x-auth', refreshResult.accessToken),
            });
            return next.handle(authReq);
          }),
          catchError(error => {
            this.isRefreshing = false;
            this.handleAuthFailure();
            return throwError(() => error);
          })
        );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null), // Ждем, пока token станет не null
        take(1), // Берем первое успешное значение и отписываемся
        switchMap((token) => {
          // Повторяем запрос с уже обновившимся токеном
          const authReq = req.clone({
            headers: req.headers.set('x-auth', token as string),
          });
          return next.handle(authReq);
        })
      );
    }
  }

  private handleAuthFailure(): void {
    this.authService.removeTokens();
    this.router.navigate(['/login']);
  }
}
