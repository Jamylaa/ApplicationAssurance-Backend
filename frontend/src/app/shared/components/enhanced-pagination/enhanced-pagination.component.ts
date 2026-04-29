import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-enhanced-pagination',
  templateUrl: './enhanced-pagination.component.html',
  styleUrls: ['./enhanced-pagination.component.scss'],
  standalone: true,
  imports: [CommonModule, PaginatorModule, FormsModule]
})
export class EnhancedPaginationComponent {
  @Input() totalRecords: number = 0;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 25, 50];
  @Input() showCurrentPageReport: boolean = true;
  @Input() showJumpToPage: boolean = true;
  @Input() showPageLinks: boolean = true;
  @Input() currentPageReportTemplate?: string;
  @Input() first: number = 0;
  
  @Output() onPageChange: EventEmitter<PaginatorState> = new EventEmitter<PaginatorState>();

  onPageChangeHandler(event: PaginatorState): void {
    this.onPageChange.emit(event);
  }

  get currentPageReport(): string {
    if (this.currentPageReportTemplate) {
      return this.currentPageReportTemplate
        .replace('{first}', String(this.first + 1))
        .replace('{last}', String(Math.min(this.first + this.rows, this.totalRecords)))
        .replace('{totalRecords}', String(this.totalRecords));
    }
    return `${this.first + 1} - ${Math.min(this.first + this.rows, this.totalRecords)} sur ${this.totalRecords}`;
  }
}
