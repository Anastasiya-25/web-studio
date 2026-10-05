import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/layout/header/header.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { MainComponent } from './views/main/main.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule} from "@angular/material/snack-bar";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {MatMenuModule} from "@angular/material/menu";
import {CarouselModule as NgxBootstrapCarouselModule} from "ngx-bootstrap/carousel";
import {CarouselModule as OwlCarouselModule} from 'ngx-owl-carousel-o';
import {SliderComponent} from "./shared/components/carousel/slider.component";
import {SharedModule} from "./shared/shared.module";
import {ReactiveFormsModule} from "@angular/forms";
import {AuthInterceptor} from "./core/auth/auth.interceptor";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LayoutComponent,
    FooterComponent,
    MainComponent,
    SliderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSnackBarModule,
    MatMenuModule,
    HttpClientModule,
    NgxBootstrapCarouselModule.forRoot(),
    OwlCarouselModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  providers: [
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
