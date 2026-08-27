import {Component, OnInit} from '@angular/core';
import {ArticleType} from "../../../types/article.type";
import {ArticlesService} from "../../shared/services/articles.service";
import {OwlOptions} from "ngx-owl-carousel-o";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  articles: ArticleType[] = [];

  customOptionsReviews: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 25,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
    },
    nav: false
  }

  reviews = [
    {
      image: "review_1.png",
      name: "Станислав",
      text: "Спасибо огромное АйтиШторму за прекрасный блог с полезными статьями! Именно они и\n" +
        "          побудили меня углубиться в тему SMM и начать свою карьеру."
    },
    {
      image: "review_2.png",
      name: "Алёна",
      text: "Обратилась в АйтиШторм за помощью копирайтера. Ни разу ещё не пожалела! Ребята действительно вкладывают душу в то, что делают, и каждый текст, который я получаю, с нетерпением хочется выложить в сеть."
    },
    {
      image: "review_3.png",
      name: "Мария",
      text: "Команда АйтиШторма за такой короткий промежуток времени сделала невозможное: от\n" +
        "          простой фирмы по услуге продвижения выросла в мощный блог о важности личного бренда. Класс!"
    }
  ]

  constructor(private articlesService: ArticlesService) {
  }

  ngOnInit(): void {
    this.articlesService.getTopArticles()
      .subscribe((data: ArticleType[]) => {
        this.articles = data;
      });
  }

}
