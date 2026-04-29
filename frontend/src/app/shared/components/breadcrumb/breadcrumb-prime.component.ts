import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumb-prime',
  template: `
    <p-breadcrumb [model]="breadcrumbItems" [home]="homeItem"></p-breadcrumb>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 1rem;
    }
    
    ::ng-deep .p-breadcrumb {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      padding: 0.75rem 1rem;
    }
    
    ::ng-deep .p-breadcrumb-item {
      color: #6c757d;
      font-size: 0.875rem;
    }
    
    ::ng-deep .p-breadcrumb-item:last-child {
      color: #495057;
      font-weight: 600;
    }
    
    ::ng-deep .p-breadcrumb-item-link {
      color: #0d6efd;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    ::ng-deep .p-breadcrumb-item-link:hover {
      color: #0a58ca;
      text-decoration: underline;
    }
  `],
  standalone: true,
  imports: [BreadcrumbModule]
})
export class BreadcrumbPrimeComponent implements OnInit, OnDestroy {
  @Input() items: { label: string; link?: string; icon?: string }[] = [];
  @Input() showHome: boolean = true;
  @Input() homeLabel: string = 'Accueil';
  @Input() homeIcon: string = 'pi pi-home';
  @Output() breadcrumbClick = new EventEmitter<any>();

  breadcrumbItems: MenuItem[] = [];
  homeItem: MenuItem | undefined;
  private routerSubscription: Subscription | undefined;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.generateBreadcrumbItems();
    this.subscribeToRouteChanges();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private generateBreadcrumbItems(): void {
    this.breadcrumbItems = [];
    
    if (this.showHome) {
      this.homeItem = {
        label: this.homeLabel,
        icon: this.homeIcon,
        command: () => this.navigateHome()
      };
    }

    if (this.items && this.items.length > 0) {
      this.breadcrumbItems = this.items.map(item => ({
        label: item.label,
        icon: item.icon,
        command: () => this.onItemClick(item)
      }));
    } else {
      this.generateFromRoute();
    }
  }

  private generateFromRoute(): void {
    const breadcrumbs: MenuItem[] = [];
    let currentRoute: ActivatedRoute | null = this.activatedRoute.root;
    let url = '';

    while (currentRoute) {
      const routeData = currentRoute.snapshot.data;
      if (routeData && routeData['breadcrumb']) {
        url += '/' + currentRoute.snapshot.url.map(segment => segment.path).join('/');
        breadcrumbs.push({
          label: routeData['breadcrumb'],
          command: () => this.router.navigate([url])
        });
      }
      currentRoute = currentRoute.firstChild;
    }

    this.breadcrumbItems = breadcrumbs;
  }

  private subscribeToRouteChanges(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.generateBreadcrumbItems();
      });
  }

  private onItemClick(item: any): void {
    this.breadcrumbClick.emit(item);
    if (item.link) {
      this.router.navigate([item.link]);
    }
  }

  private navigateHome(): void {
    this.router.navigate(['/']);
  }
}
