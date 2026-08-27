import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";

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

    console.log('0. Header Component initialized!');

    this.authService.isLogged$
      .subscribe((isLoggedIn: boolean) => {
        console.log('1. Значение isLoggedIn:', isLoggedIn);
        this.isLogged = isLoggedIn;

        if (isLoggedIn) {
          console.log('2. Отправляем запрос getUserInfo...');
          this.authService.getUserInfo()
            .subscribe((data: UserInfoType | DefaultResponseType) => {
              console.log('3. Успешный ответ сервера:', data);
              if ((data as DefaultResponseType).error !== undefined) {
                throw new Error((data as DefaultResponseType).message);
              }
                console.log(data as UserInfoType);
              this.userName = (data as UserInfoType).name;
            })
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
