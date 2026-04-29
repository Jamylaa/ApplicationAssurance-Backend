import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-breadcrumb-refactored',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbModule
  ],
  templateUrl: './breadcrumb-refactored.component.html',
  styleUrls: ['./breadcrumb-refactored.component.scss']
})
export class BreadcrumbRefactoredComponent implements OnInit {

  @Input() items: BreadcrumbItem[] = [];
  @Input() home: BreadcrumbItem = { label: 'Accueil', url: '/admin', icon: 'pi pi-home' };
  @Input() showHome: boolean = true;
  @Input() maxItems: number = 5;
  @Input() styleClass: string = '';

  processedItems: BreadcrumbItem[] = [];

  constructor() { }

  ngOnInit(): void {
    this.processItems();
  }

  private processItems(): void {
    let itemsToProcess = [...this.items];

    // Limiter le nombre d'éléments
    if (itemsToProcess.length > this.maxItems) {
      const keepFirst = Math.floor((this.maxItems - 1) / 2);
      const keepLast = this.maxItems - 1 - keepFirst;

      const firstItems = itemsToProcess.slice(0, keepFirst);
      const lastItems = itemsToProcess.slice(-keepLast);

      itemsToProcess = [
        ...firstItems,
        { label: '...', disabled: true },
        ...lastItems
      ];
    }

    this.processedItems = itemsToProcess;
  }

  isItemDisabled(item: BreadcrumbItem): boolean {
    return item.disabled === true || !item.url;
  }

  getItemIcon(item: BreadcrumbItem): string {
    return item.icon || '';
  }

  getItemClass(item: BreadcrumbItem): string {
    const classes = ['breadcrumb-item'];

    if (this.isItemDisabled(item)) {
      classes.push('disabled');
    }

    if (item.icon) {
      classes.push('with-icon');
    }

    return classes.join(' ');
  }
}
