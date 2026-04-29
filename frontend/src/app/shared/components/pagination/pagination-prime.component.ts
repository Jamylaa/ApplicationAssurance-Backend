import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

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
  selector: 'app-pagination-prime',
  template: `
    <div class="pagination-container">
      <p-paginator 
        [first]="(config.currentPage - 1) * config.pageSize"
        [rows]="config.pageSize"
        [totalRecords]="config.totalItems"
        [rowsPerPageOptions]="config.pageSizeOptions || [5, 10, 25, 50, 100]"
        [showCurrentPageReport]="true"
        [showPageLinks]="true"
        [showJumpToPageDropdown]="config.showJumpToPage"
        [showFirstLastIcon]="config.showFirstLastButtons"
        (onPageChange)="onPageChange($event)"
        (onRowsPerPageChange)="onPageSizeChange($event)"
        [templateLeft]="leftTemplate"
        [templateRight]="rightTemplate">
      </p-paginator>
      
      <ng-template #leftTemplate let-state>
        <span class="pagination-info">
          Affichage de {{ (state.first + 1) }}-{{ Math.min(state.first + state.rows, state.totalRecords) }} sur {{ state.totalRecords }} éléments
        </span>
      </ng-template>
      
      <ng-template #rightTemplate let-state>
        <div class="pagination-actions">
          <button 
            *ngIf="showJumpToPageInput"
            pButton 
            type="button" 
            label="Aller à" 
            icon="pi pi-angle-double-right"
            class="p-button-outlined p-button-sm"
            (click)="toggleJumpToPage()">
          </button>
          
          <div *ngIf="showJumpInput" class="jump-to-page">
            <p-inputNumber 
              [(ngModel)]="jumpToPageValue"
              [min]="1"
              [max]="totalPages"
              placeholder="Page"
              style="width: 80px;"
              (onEnter)="navigateToPage()">
            </p-inputNumber>
            <button 
              pButton 
              type="button" 
              label="Go"
              class="p-button-sm"
              (click)="navigateToPage()">
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .pagination-info {
      color: #6c757d;
      font-size: 0.875rem;
      margin-right: 1rem;
    }

    .pagination-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .jump-to-page {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: 1rem;
    }

    ::ng-deep .p-paginator {
      background: transparent;
      border: none;
      padding: 0;
    }

    ::ng-deep .p-paginator-page-options {
      margin-left: 1rem;
    }

    ::ng-deep .p-paginator-current {
      margin: 0 0.5rem;
    }

    ::ng-deep .p-paginator-pages {
      margin: 0 0.5rem;
    }

    ::ng-deep .p-paginator-page {
      min-width: 2.5rem;
      height: 2.5rem;
    }

    ::ng-deep .p-paginator-page.p-paginator-page-selected {
      background: #0d6efd;
      border-color: #0d6efd;
    }

    @media (max-width: 768px) {
      .pagination-container {
        align-items: center;
      }

      .pagination-info {
        font-size: 0.8rem;
        margin-bottom: 0.5rem;
      }

      .pagination-actions {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
      }

      .jump-to-page {
        margin-left: 0;
        margin-top: 0.5rem;
      }
    }
  `],
  standalone: true,
  imports: [PaginatorModule]
})
export class PaginationPrimeComponent implements OnChanges {
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

  @Input() showJumpToPageInput: boolean = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  jumpToPageValue: number = 1;
  showJumpInput: boolean = false;
  totalPages: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.calculateTotalPages();
    }
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.config.totalItems / this.config.pageSize) || 1;
  }

  onPageChange(event: PaginatorState): void {
    const newPage = Math.floor((event.first || 0) / (event.rows || 1)) + 1;
    if (newPage !== this.config.currentPage) {
      this.pageChange.emit(newPage);
    }
  }

  onPageSizeChange(event: any): void {
    if (event.value !== this.config.pageSize) {
      this.pageSizeChange.emit(event.value);
    }
  }

  toggleJumpToPage(): void {
    this.showJumpInput = !this.showJumpInput;
    if (this.showJumpInput) {
      this.jumpToPageValue = this.config.currentPage;
    }
  }

  navigateToPage(): void {
    if (this.jumpToPageValue >= 1 && this.jumpToPageValue <= this.totalPages) {
      this.pageChange.emit(this.jumpToPageValue);
      this.showJumpInput = false;
    }
  }
}
