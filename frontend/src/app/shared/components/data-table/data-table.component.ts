import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <div class="data-table-container">
      <p-table 
        [value]="data" 
        [paginator]="true" 
        [rows]="rowsPerPage"
        [first]="first"
        [totalRecords]="totalRecords"
        [loading]="loading"
        [lazy]="lazy"
        [globalFilterFields]="filterFields"
        (onLazyLoad)="onLazyLoad.emit($event)"
        (onPage)="onPage.emit($event)"
        (onSort)="onSort.emit($event)"
        (onFilter)="onFilter.emit($event)"
        [rowsPerPageOptions]="[10, 25, 50]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Affichage {first} à {last} de {totalRecords} entrées"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown">
        
        <ng-template pTemplate="header">
          <tr>
            <th *ngFor="let col of columns" 
                [pSortableColumn]="col.field" 
                [pSortableColumnDisabled]="!col.sortable">
              {{col.header}}
              <p-sortIcon [field]="col.field" *ngIf="col.sortable"></p-sortIcon>
            </th>
            <th style="width: 120px;">Actions</th>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="body" let-rowData let-rowIndex="rowIndex">
          <tr [pSelectableRow]="rowData">
            <td *ngFor="let col of columns">
              {{rowData[col.field]}}
            </td>
            <td>
              <div class="action-buttons">
                <button pButton 
                        icon="pi pi-pencil" 
                        class="p-button-rounded p-button-info p-button-sm" 
                        (click)="edit.emit(rowData)"
                        pTooltip="Modifier"
                        tooltipPosition="top">
                </button>
                <button pButton 
                        icon="pi pi-trash" 
                        class="p-button-rounded p-button-danger p-button-sm ml-2" 
                        (click)="delete.emit(rowData)"
                        pTooltip="Supprimer"
                        tooltipPosition="top">
                </button>
              </div>
            </td>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="columns.length + 1" class="text-center">
              <div class="empty-message">
                <i class="pi pi-inbox" style="font-size: 2rem; color: #6c757d;"></i>
                <p>Aucune donnée disponible</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent<T> implements OnInit {
  @Input() data: T[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading = false;
  @Input() rowsPerPage = 10;
  @Input() totalRecords = 0;
  @Input() first = 0;
  @Input() lazy = false;
  @Input() filterFields: string[] = [];

  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();
  @Output() onPage = new EventEmitter<any>();
  @Output() onSort = new EventEmitter<any>();
  @Output() onFilter = new EventEmitter<any>();
  @Output() onLazyLoad = new EventEmitter<any>();

  ngOnInit() {
    // Initialiser les filterFields avec les colonnes si non spécifié
    if (this.filterFields.length === 0) {
      this.filterFields = this.columns.map(col => col.field);
    }
  }
}
