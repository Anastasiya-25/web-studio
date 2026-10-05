import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {distinctUntilChanged} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLogged: boolean = false;
  userName: string = '';

  constructor(private authService: AuthService, private _snackBar: MatSnackBar,
              private router: Router) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {

    this.authService.isLogged$
      .pipe(
        distinctUntilChanged()
      )
      .subscribe((isLoggedIn: boolean) => {
        this.isLogged = isLoggedIn;

        if (isLoggedIn) {
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
      });

  }

  logout() {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: () => {
          this.doLogout()
        }
      })
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open("Вы успешно вышли из ситемы");
    this.router.navigate(['/']);
  }

}
