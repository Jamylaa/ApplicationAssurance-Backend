import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'daterange' | 'boolean';
  placeholder?: string;
  options?: { value: any; label: string }[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export interface FilterConfig {
  fields: FilterField[];
  showReset?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

export interface FilterValues {
  [key: string]: any;
}

@Component({
  selector: 'app-filter',
  template: `
    <div class="filter-container">
      <!-- Search Bar -->
      <div *ngIf="config.showSearch" class="search-bar mb-3">
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input 
            type="text" 
            class="form-control" 
            [placeholder]="config.searchPlaceholder || 'Rechercher...'"
            [formControl]="searchControl"
            (keyup.enter)="onSearch()">
          <button 
            class="btn btn-outline-secondary" 
            type="button"
            (click)="onSearch()">
            Rechercher
          </button>
        </div>
      </div>

      <!-- Filter Form -->
      <form [formGroup]="filterForm" class="filter-form">
        <div [ngClass]="getLayoutClass()">
          <div 
            *ngFor="let field of config.fields; trackBy: trackByField" 
            [ngClass]="getFieldClass(field)">
            
            <!-- Text Input -->
            <div *ngIf="field.type === 'text'" class="mb-3">
              <label [for]="field.key" class="form-label">
                {{ field.label }}
                <span *ngIf="field.required" class="text-danger">*</span>
              </label>
              <input 
                [id]="field.key"
                type="text" 
                class="form-control"
                [placeholder]="field.placeholder || ''"
                [formControlName]="field.key">
            </div>

            <!-- Number Input -->
            <div *ngIf="field.type === 'number'" class="mb-3">
              <label [for]="field.key" class="form-label">
                {{ field.label }}
                <span *ngIf="field.required" class="text-danger">*</span>
              </label>
              <input 
                [id]="field.key"
                type="number" 
                class="form-control"
                [placeholder]="field.placeholder || ''"
                [formControlName]="field.key"
                [min]="field.min"
                [max]="field.max"
                [step]="field.step || 1">
            </div>

            <!-- Select Dropdown -->
            <div *ngIf="field.type === 'select'" class="mb-3">
              <label [for]="field.key" class="form-label">
                {{ field.label }}
                <span *ngIf="field.required" class="text-danger">*</span>
              </label>
              <select 
                [id]="field.key"
                class="form-select"
                [formControlName]="field.key">
                <option value="">Sélectionner...</option>
                <option 
                  *ngFor="let option of field.options; trackBy: trackByOption" 
                  [value]="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Date Input -->
            <div *ngIf="field.type === 'date'" class="mb-3">
              <label [for]="field.key" class="form-label">
                {{ field.label }}
                <span *ngIf="field.required" class="text-danger">*</span>
              </label>
              <input 
                [id]="field.key"
                type="date" 
                class="form-control"
                [formControlName]="field.key">
            </div>

            <!-- Date Range -->
            <div *ngIf="field.type === 'daterange'" class="mb-3">
              <label class="form-label">
                {{ field.label }}
                <span *ngIf="field.required" class="text-danger">*</span>
              </label>
              <div class="row g-2">
                <div class="col">
                  <input 
                    type="date" 
                    class="form-control"
                    [placeholder]="'Début'"
                    [formControlName]="field.key + '_start'">
                </div>
                <div class="col">
                  <input 
                    type="date" 
                    class="form-control"
                    [placeholder]="'Fin'"
                    [formControlName]="field.key + '_end'">
                </div>
              </div>
            </div>

            <!-- Boolean Checkbox -->
            <div *ngIf="field.type === 'boolean'" class="mb-3">
              <div class="form-check">
                <input 
                  [id]="field.key"
                  type="checkbox" 
                  class="form-check-input"
                  [formControlName]="field.key">
                <label [for]="field.key" class="form-check-label">
                  {{ field.label }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <button 
            type="button" 
            class="btn btn-primary me-2" 
            (click)="onApplyFilters()">
            <i class="bi bi-funnel me-1"></i>
            Appliquer
          </button>
          
          <button 
            *ngIf="config.showReset"
            type="button" 
            class="btn btn-outline-secondary me-2" 
            (click)="onResetFilters()">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Réinitialiser
          </button>

          <button 
            type="button" 
            class="btn btn-outline-secondary" 
            (click)="onClearFilters()">
            <i class="bi bi-x-circle me-1"></i>
            Effacer
          </button>
        </div>
      </form>

      <!-- Active Filters Display -->
      <div *ngIf="hasActiveFilters()" class="active-filters mt-3">
        <h6>Filtres actifs:</h6>
        <div class="filter-tags">
          <span 
            *ngFor="let activeFilter of getActiveFilters(); trackBy: trackByActiveFilter" 
            class="badge bg-primary me-2 mb-1 filter-tag">
            {{ activeFilter.label }}: {{ activeFilter.value }}
            <button 
              type="button" 
              class="btn-close btn-close-white ms-1" 
              (click)="removeFilter(activeFilter.key)">
            </button>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-container {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 0.5rem;
      border: 1px solid #dee2e6;
      margin-bottom: 1rem;
    }

    .search-bar .input-group-text {
      background-color: #e9ecef;
      border-color: #ced4da;
    }

    .filter-form {
      margin-bottom: 1rem;
    }

    .layout-horizontal {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-end;
    }

    .layout-vertical > div {
      width: 100%;
    }

    .layout-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .field-full-width {
      grid-column: 1 / -1;
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }

    .active-filters {
      background: white;
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid #e9ecef;
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .filter-tag {
      display: inline-flex;
      align-items: center;
      font-size: 0.875rem;
      padding: 0.375rem 0.75rem;
    }

    .filter-tag .btn-close {
      font-size: 0.75rem;
      padding: 0.125rem 0.25rem;
      margin-left: 0.5rem;
    }

    .form-label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .filter-container {
        padding: 1rem;
      }

      .layout-horizontal {
        flex-direction: column;
        align-items: stretch;
      }

      .layout-grid {
        grid-template-columns: 1fr;
      }

      .filter-actions {
        flex-direction: column;
      }

      .filter-actions .btn {
        width: 100%;
        margin-bottom: 0.5rem;
      }

      .filter-tags {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class FilterComponent implements OnInit, OnChanges {
  @Input() config: FilterConfig = {
    fields: [],
    showReset: true,
    showSearch: true,
    searchPlaceholder: 'Rechercher...',
    layout: 'vertical'
  };

  @Input() initialValues: FilterValues = {};

  @Output() filterChange = new EventEmitter<FilterValues>();
  @Output() search = new EventEmitter<string>();

  filterForm: FormGroup;
  searchControl: FormControl;

  constructor(private formBuilder: FormBuilder) {
    this.searchControl = new FormControl('');
    this.filterForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.initializeForm();
    }
    if (changes['initialValues']) {
      this.setInitialValues();
    }
  }

  private initializeForm(): void {
    const formGroup: { [key: string]: FormControl } = {};

    this.config.fields.forEach(field => {
      if (field.type === 'daterange') {
        formGroup[field.key + '_start'] = new FormControl(this.initialValues[field.key + '_start'] || '');
        formGroup[field.key + '_end'] = new FormControl(this.initialValues[field.key + '_end'] || '');
      } else {
        const defaultValue = this.getDefaultValue(field);
        formGroup[field.key] = new FormControl(
          this.initialValues[field.key] !== undefined ? this.initialValues[field.key] : defaultValue
        );
      }
    });

    this.filterForm = this.formBuilder.group(formGroup);
  }

  private getDefaultValue(field: FilterField): any {
    const min = field.min ?? 0;
    switch (field.type) {
      case 'boolean':
        return false;
      case 'number':
        return min;
      case 'select':
        return '';
      case 'text':
      case 'date':
      default:
        return '';
    }
  }

  private setInitialValues(): void {
    if (Object.keys(this.initialValues).length > 0) {
      this.filterForm.patchValue(this.initialValues);
    }
  }

  getLayoutClass(): string {
    return `layout-${this.config.layout || 'vertical'}`;
  }

  getFieldClass(field: FilterField): string {
    return field.type === 'daterange' ? 'col-12' : '';
  }

  trackByField(index: number, field: FilterField): string {
    return field.key;
  }

  trackByOption(index: number, option: { value: any; label: string }): any {
    return option.value;
  }

  trackByActiveFilter(index: number, filter: { key: string; label: string; value: string }): string {
    return filter.key;
  }

  onSearch(): void {
    const searchTerm = this.searchControl.value?.trim();
    this.search.emit(searchTerm);
  }

  onApplyFilters(): void {
    const formValue = this.filterForm.value;
    const processedValue: FilterValues = {};

    this.config.fields.forEach(field => {
      if (field.type === 'daterange') {
        const startKey = field.key + '_start';
        const endKey = field.key + '_end';
        
        if (formValue[startKey] || formValue[endKey]) {
          processedValue[field.key] = {
            start: formValue[startKey],
            end: formValue[endKey]
          };
        }
      } else if (formValue[field.key] !== '' && formValue[field.key] !== null && formValue[field.key] !== undefined) {
        processedValue[field.key] = formValue[field.key];
      }
    });

    this.filterChange.emit(processedValue);
  }

  onResetFilters(): void {
    this.filterForm.reset();
    this.searchControl.setValue('');
    
    const resetValues: FilterValues = {};
    this.config.fields.forEach(field => {
      if (field.type === 'daterange') {
        resetValues[field.key + '_start'] = '';
        resetValues[field.key + '_end'] = '';
      } else {
        resetValues[field.key] = this.getDefaultValue(field);
      }
    });
    
    this.filterForm.patchValue(resetValues);
    this.filterChange.emit({});
  }

  onClearFilters(): void {
    this.filterForm.reset();
    this.searchControl.setValue('');
    this.filterChange.emit({});
  }

  hasActiveFilters(): boolean {
    return this.getActiveFilters().length > 0;
  }

  getActiveFilters(): { key: string; label: string; value: string }[] {
    const activeFilters: { key: string; label: string; value: string }[] = [];
    const formValue = this.filterForm.value;

    this.config.fields.forEach(field => {
      if (field.type === 'daterange') {
        const startKey = field.key + '_start';
        const endKey = field.key + '_end';
        
        if (formValue[startKey] || formValue[endKey]) {
          const start = formValue[startKey] || '';
          const end = formValue[endKey] || '';
          activeFilters.push({
            key: field.key,
            label: field.label,
            value: start && end ? `${start} - ${end}` : (start || end)
          });
        }
      } else if (formValue[field.key] && formValue[field.key] !== '') {
        let displayValue = formValue[field.key];
        
        if (field.type === 'select' && field.options) {
          const option = field.options.find(opt => opt.value === formValue[field.key]);
          displayValue = option ? option.label : formValue[field.key];
        } else if (field.type === 'boolean') {
          displayValue = formValue[field.key] ? 'Oui' : 'Non';
        }
        
        activeFilters.push({
          key: field.key,
          label: field.label,
          value: displayValue
        });
      }
    });

    return activeFilters;
  }

  removeFilter(key: string): void {
    if (key.includes('_start') || key.includes('_end')) {
      const baseKey = key.replace(/_start|_end/, '');
      this.filterForm.patchValue({
        [baseKey + '_start']: '',
        [baseKey + '_end']: ''
      });
    } else {
      const field = this.config.fields.find(f => f.key === key);
      this.filterForm.patchValue({ [key]: this.getDefaultValue(field || {} as FilterField) });
    }
    
    this.onApplyFilters();
  }
}
