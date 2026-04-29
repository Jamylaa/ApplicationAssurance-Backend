import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-enhanced-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule],
  template: `
    <div class="enhanced-breadcrumb">
      <nav class="breadcrumb-nav">
        <ol class="breadcrumb">
          <li class="breadcrumb-item" *ngFor="let item of items; let last = last">
            <a 
              *ngIf="!last && item.url; else noLink"
              [routerLink]="item.url"
              class="breadcrumb-link">
              <i *ngIf="item.icon" class="{{item.icon}} mr-2"></i>
              {{item.label}}
            </a>
            <ng-template #noLink>
              <span class="breadcrumb-current">
                <i *ngIf="item.icon" class="{{item.icon}} mr-2"></i>
                {{item.label}}
              </span>
            </ng-template>
          </li>
        </ol>
      </nav>
    </div>
  `,
  styleUrls: ['./enhanced-breadcrumb.component.scss']
})
export class EnhancedBreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];

  constructor(private router: Router) {}
}
