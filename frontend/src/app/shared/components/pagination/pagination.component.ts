import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showFirstLastButtons?: boolean;
  showJumpToPage?: boolean;
  maxVisiblePages?: number;
}

@Component({
  selector: 'app-pagination',
  template: `
    <div class="pagination-container">
      <div *ngIf="config.showPageSizeSelector" class="page-size-selector mb-2">
        <label class="form-label me-2">Articles par page:</label>
        <select class="form-select form-select-sm" [value]="config.pageSize" (change)="onPageSizeChange($event)">
          <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }}</option>
        </select>
        <span class="ms-2 text-muted small">Total: {{ config.totalItems }} articles</span>
      </div>

      <nav aria-label="Pagination">
        <ul class="pagination pagination-sm">
          <li *ngIf="config.showFirstLastButtons" class="page-item" [class.disabled]="config.currentPage === 1">
            <button class="page-link" (click)="goToFirstPage()" [disabled]="config.currentPage === 1" aria-label="Première page">
              <i class="bi bi-chevron-double-left"></i>
            </button>
          </li>

          <li class="page-item" [class.disabled]="config.currentPage === 1">
            <button class="page-link" (click)="goToPreviousPage()" [disabled]="config.currentPage === 1" aria-label="Page précédente">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>

          <li *ngFor="let page of visiblePages; trackBy: trackByPage" class="page-item" [class.active]="page === config.currentPage" [class.disabled]="page === '...'">
            <button *ngIf="page !== '...'" class="page-link" (click)="goToPage(page)" [attr.aria-current]="page === config.currentPage ? 'page' : null">
              {{ page }}
            </button>
            <span *ngIf="page === '...'" class="page-link">...</span>
          </li>

          <li class="page-item" [class.disabled]="config.currentPage === totalPages">
            <button class="page-link" (click)="goToNextPage()" [disabled]="config.currentPage === totalPages" aria-label="Page suivante">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>

          <li *ngIf="config.showFirstLastButtons" class="page-item" [class.disabled]="config.currentPage === totalPages">
            <button class="page-link" (click)="goToLastPage()" [disabled]="config.currentPage === totalPages" aria-label="Dernière page">
              <i class="bi bi-chevron-double-right"></i>
            </button>
          </li>
        </ul>
      </nav>

      <div *ngIf="config.showJumpToPage" class="jump-to-page mt-2">
        <label class="form-label me-2">Aller à la page:</label>
        <div class="input-group" style="width: 200px;">
          <input type="number" class="form-control form-control-sm" [value]="config.currentPage" [min]="1" [max]="totalPages" (change)="onJumpToPageChange($event)" (keyup.enter)="onJumpToPageEnter($event)">
          <button class="btn btn-outline-secondary btn-sm" type="button" (click)="jumpToCurrentPage()">Aller</button>
        </div>
      </div>

      <div class="pagination-info mt-2 text-muted small">
        Affichage de {{ startIndex + 1 }}-{{ endIndex }} sur {{ config.totalItems }} articles
      </div>
    </div>
  `,
  styles: [`
    .pagination-container { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .page-size-selector { display: flex; align-items: center; gap: 0.5rem; }
    .pagination { margin: 0; }
    .page-link { cursor: pointer; transition: all 0.2s ease; }
    .page-link:hover:not(.disabled) { background-color: #e9ecef; transform: translateY(-1px); }
    .page-item.active .page-link { background-color: #0d6efd; border-color: #0d6efd; color: white; font-weight: 600; }
    .jump-to-page { display: flex; align-items: center; gap: 0.5rem; }
    .pagination-info { font-size: 0.875rem; }
    @media (max-width: 768px) {
      .pagination-container { align-items: stretch; }
      .page-size-selector { flex-direction: column; align-items: flex-start; }
      .jump-to-page { flex-direction: column; align-items: flex-start; }
      .input-group { width: 100% !important; }
      .pagination { flex-wrap: wrap; justify-content: center; }
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class PaginationComponent implements OnChanges {
  @Input() config: PaginationConfig = {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    pageSizeOptions: [5, 10, 25, 50, 100],
    showPageSizeSelector: true,
    showFirstLastButtons: true,
    showJumpToPage: false,
    maxVisiblePages: 7
  };

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  visiblePages: (number | string)[] = [];
  totalPages: number = 0;
  startIndex: number = 0;
  endIndex: number = 0;
  pageSizeOptions: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.updateCalculations();
      this.generateVisiblePages();
    }
  }

  private updateCalculations(): void {
    this.totalPages = Math.ceil(this.config.totalItems / this.config.pageSize) || 1;
    this.startIndex = (this.config.currentPage - 1) * this.config.pageSize;
    this.endIndex = Math.min(this.startIndex + this.config.pageSize, this.config.totalItems);
    this.pageSizeOptions = this.config.pageSizeOptions || [5, 10, 25, 50, 100];
  }

  private generateVisiblePages(): void {
    const { currentPage, maxVisiblePages = 7 } = this.config;
    const pages: (number | string)[] = [];
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      
      if (currentPage <= halfVisible) {
        for (let i = 1; i <= maxVisiblePages - 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      } else if (currentPage > this.totalPages - halfVisible) {
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - maxVisiblePages + 2; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      }
    }
    
    this.visiblePages = pages;
  }

  trackByPage(index: number, page: number | string): number | string {
    return page;
  }

  goToPage(page: number | string): void {
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    if (pageNum >= 1 && pageNum <= this.totalPages && pageNum !== this.config.currentPage) {
      this.pageChange.emit(pageNum);
    }
  }

  goToFirstPage(): void {
    if (this.config.currentPage !== 1) {
      this.goToPage(1);
    }
  }

  goToLastPage(): void {
    if (this.config.currentPage !== this.totalPages) {
      this.goToPage(this.totalPages);
    }
  }

  goToPreviousPage(): void {
    if (this.config.currentPage > 1) {
      this.goToPage(this.config.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.config.currentPage < this.totalPages) {
      this.goToPage(this.config.currentPage + 1);
    }
  }

  onPageSizeChange(event: Event): void {
    const newSize = parseInt((event.target as HTMLSelectElement).value);
    if (newSize !== this.config.pageSize) {
      this.pageSizeChange.emit(newSize);
    }
  }

  onJumpToPageChange(event: Event): void {
    const targetPage = parseInt((event.target as HTMLInputElement).value);
    if (targetPage >= 1 && targetPage <= this.totalPages) {
      this.goToPage(targetPage);
    }
  }

  onJumpToPageEnter(event: any): void {
    const targetPage = parseInt((event.target as HTMLInputElement).value);
    if (targetPage >= 1 && targetPage <= this.totalPages) {
      this.goToPage(targetPage);
    }
  }

  jumpToCurrentPage(): void {
    const input = document.querySelector('.jump-to-page input') as HTMLInputElement;
    const targetPage = parseInt(input.value);
    if (targetPage >= 1 && targetPage <= this.totalPages) {
      this.goToPage(targetPage);
    }
  }
}
