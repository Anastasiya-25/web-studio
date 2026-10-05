import {Component, HostListener, OnInit} from '@angular/core';
import {ArticlesService} from "../../../shared/services/articles.service";
import {ArticleType} from "../../../../types/article.type";
import {CategoryType} from "../../../../types/category.type";
import {CategoriesService} from "../../../shared/services/categories.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {AppliedFilter} from "../../../../types/appliedFilter.type";

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  articles: ArticleType[] = [];
  categories: CategoryType[] = [];
  services: string[] = [];
  open: boolean = false;
  activeParams: string[] = [];
  appliedFilters: AppliedFilter[] = [];
  pages: number[] = [];
  activePage: number = 1;

  constructor(private articlesService: ArticlesService, private categoriesService: CategoriesService, private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.categoriesService.getCategories()
      .subscribe((data: CategoryType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.categories = data as CategoryType[];
        this.services = this.categories.map(item => item.name);

        this.activatedRoute.queryParams.subscribe(params => {
          if (params['categories']) {
            this.activeParams = Array.isArray(params['categories'])
              ? params['categories']
              : [params['categories']];
          } else {
            this.activeParams = [];
          }
          if (params['page']) {
            this.activePage = Number(params['page']);
          } else {
            this.activePage = 1;
          }

          this.appliedFilters = [];
          this.activeParams.forEach(url => {

            const found = this.categories.find(item => item.url === url);
            if (found) {
              this.appliedFilters.push({
                name: found.name,
                url: found.url,
              })
            }
          });

          this.articlesService.getArticles(this.activeParams, this.activePage)
            .subscribe(articles => {
              this.pages = [];
              for (let i = 1; i <= articles.pages; i++) {
                this.pages.push(i);
              }
              this.articles = articles.items;
            });
        });
      });
  }

  toggle() {
    this.open = !this.open;
  }

  updateFilterParam(url: string): void {
    if (!this.activeParams) {
      this.activeParams = [];
    }

    const index = this.activeParams.indexOf(url);

    if (index !== -1) {
      this.activeParams = this.activeParams.filter(item => item !== url);
    } else {
      this.activeParams = [...this.activeParams, url];
    }
    this.activePage = 1;

    this.router.navigate(['/blog'], {
      queryParams: {
        categories: this.activeParams.length > 0 ? this.activeParams : null,
        page: null
      },
      queryParamsHandling: 'merge'
    });
  }

  isCategoryActive(url: string): boolean {
    return Array.isArray(this.activeParams) && this.activeParams.includes(url);
  }

  removeAppliedFilter(appliedFilter: AppliedFilter) {
    this.activeParams = this.activeParams.filter(item => item !== appliedFilter.url);
    this.router.navigate(['/blog'], {
      queryParams: {
        categories: this.activeParams.length > 0 ? this.activeParams : null,
        page: null
      },
      queryParamsHandling: 'merge'
    });
  }

  selectPage(page: number) {
    this.activePage = page;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: page > 1 ? page : null
      },
      queryParamsHandling: 'merge'
    });
  }

  openPrevPage() {
    if (this.pages && this.activePage > 1) {
      this.activePage--;
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          page: this.activePage > 1 ? this.activePage : null
        },
        queryParamsHandling: 'merge'
      });
    }
  }

  openNextPage() {
    const currentPage = Number(this.activePage) || 1;
    if (currentPage < this.pages.length) {
      this.activePage++;
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          page: this.activePage
        },
        queryParamsHandling: 'merge'
      });
    }
  }

  @HostListener('document:click', ['$event'])
  click(event
        :
        Event
  ) {
    if (this.open && (event.target as HTMLInputElement).className.indexOf('blog-filter') === -1) {
      this.open = false;
    }
  }
}
