import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { PanelModule } from 'primeng/panel';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'daterange' | 'boolean' | 'multiselect' | 'slider';
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
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface FilterValues {
  [key: string]: any;
}

@Component({
  selector: 'app-filter-prime',
  template: `
    <p-panel [header]="title" [toggleable]="config.collapsible" [(collapsed)]="isCollapsed" class="filter-panel">
      <div class="filter-container">
        <!-- Search Bar -->
        <div *ngIf="config.showSearch" class="search-bar mb-3">
          <span class="p-float-label">
            <i class="pi pi-search"></i>
            <p-inputText 
              [placeholder]="config.searchPlaceholder || 'Rechercher...'"
              [(ngModel)]="searchTerm"
              (keyup.enter)="onSearch()"
              style="width: 100%;">
            </p-inputText>
            <label for="search">Recherche</label>
          </span>
          <p-button 
            label="Rechercher" 
            icon="pi pi-search"
            (click)="onSearch()"
            class="search-button">
          </p-button>
        </div>

        <!-- Filter Form -->
        <form [formGroup]="filterForm" class="filter-form">
          <div [ngClass]="getLayoutClass()">
            <div 
              *ngFor="let field of config.fields; trackBy: trackByField" 
              [ngClass]="getFieldClass(field)">
              
              <!-- Text Input -->
              <div *ngIf="field.type === 'text'" class="field-container mb-3">
                <span class="p-float-label">
                  <p-inputText 
                    [id]="field.key"
                    [placeholder]="field.placeholder || ''"
                    [formControlName]="field.key"
                    [style]="{'width': '100%'}">
                  </p-inputText>
                  <label [for]="field.key">{{ field.label }}<span *ngIf="field.required" class="required">*</span></label>
                </span>
              </div>

              <!-- Number Input -->
              <div *ngIf="field.type === 'number'" class="field-container mb-3">
                <span class="p-float-label">
                  <p-inputNumber 
                    [id]="field.key"
                    [placeholder]="field.placeholder || ''"
                    [formControlName]="field.key"
                    [min]="field.min"
                    [max]="field.max"
                    [step]="field.step || 1"
                    [style]="{'width': '100%'}">
                  </p-inputNumber>
                  <label [for]="field.key">{{ field.label }}<span *ngIf="field.required" class="required">*</span></label>
                </span>
              </div>

              <!-- Select Dropdown -->
              <div *ngIf="field.type === 'select'" class="field-container mb-3">
                <span class="p-float-label">
                  <p-dropdown 
                    [id]="field.key"
                    [options]="field.options || []"
                    [optionLabel]="'label'"
                    [optionValue]="'value'"
                    [placeholder]="'Sélectionner...'"
                    [formControlName]="field.key"
                    [style]="{'width': '100%'}"
                    [showClear]="true">
                  </p-dropdown>
                  <label [for]="field.key">{{ field.label }}<span *ngIf="field.required" class="required">*</span></label>
                </span>
              </div>

              <!-- Multi Select -->
              <div *ngIf="field.type === 'multiselect'" class="field-container mb-3">
                <span class="p-float-label">
                  <p-multiSelect 
                    [id]="field.key"
                    [options]="field.options || []"
                    [optionLabel]="'label'"
                    [optionValue]="'value'"
                    [placeholder]="'Sélectionner...'"
                    [formControlName]="field.key"
                    [style]="{'width': '100%'}"
                    [showToggleAll]="true">
                  </p-multiSelect>
                  <label [for]="field.key">{{ field.label }}<span *ngIf="field.required" class="required">*</span></label>
                </span>
              </div>

              <!-- Date Input -->
              <div *ngIf="field.type === 'date'" class="field-container mb-3">
                <span class="p-float-label">
                  <p-calendar 
                    [id]="field.key"
                    [formControlName]="field.key"
                    [showIcon]="true"
                    [dateFormat]="'dd/mm/yy'"
                    [style]="{'width': '100%'}">
                  </p-calendar>
                  <label [for]="field.key">{{ field.label }}<span *ngIf="field.required" class="required">*</span></label>
                </span>
              </div>

              <!-- Date Range -->
              <div *ngIf="field.type === 'daterange'" class="field-container mb-3">
                <label class="field-label">{{ field.label }}<span *ngIf="field.required" class="required">*</span></label>
                <div class="date-range-container">
                  <span class="p-float-label">
                    <p-calendar 
                      [id]="field.key + '_start'"
                      [formControlName]="field.key + '_start'"
                      [placeholder]="'Début'"
                      [showIcon]="true"
                      [dateFormat]="'dd/mm/yy'"
                      [style]="{'width': '100%'}">
                    </p-calendar>
                    <label [for]="field.key + '_start'">Début</label>
                  </span>
                  <span class="p-float-label">
                    <p-calendar 
                      [id]="field.key + '_end'"
                      [formControlName]="field.key + '_end'"
                      [placeholder]="'Fin'"
                      [showIcon]="true"
                      [dateFormat]="'dd/mm/yy'"
                      [style]="{'width': '100%'}">
                    </p-calendar>
                    <label [for]="field.key + '_end'">Fin</label>
                  </span>
                </div>
              </div>

              <!-- Boolean Checkbox -->
              <div *ngIf="field.type === 'boolean'" class="field-container mb-3">
                <p-checkbox 
                  [id]="field.key"
                  [label]="field.label"
                  [formControlName]="field.key"
                  [binary]="true">
                </p-checkbox>
              </div>

              <!-- Slider -->
              <div *ngIf="field.type === 'slider'" class="field-container mb-3">
                <label class="field-label">{{ field.label }}<span *ngIf="field.required" class="required">*</span></label>
                <p-slider 
                  [id]="field.key"
                  [formControlName]="field.key"
                  [min]="field.min || 0"
                  [max]="field.max || 100"
                  [step]="field.step || 1"
                  [style]="{'width': '100%'}"
                  [range]="true">
                </p-slider>
                <div class="slider-labels">
                  <span>{{ filterForm.get(field.key)?.value?.[0] || field.min }}</span>
                  <span>{{ filterForm.get(field.key)?.value?.[1] || field.max }}</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <p-button 
            label="Appliquer" 
            icon="pi pi-filter"
            (click)="onApplyFilters()"
            class="p-button-outlined me-2">
          </p-button>
          
          <p-button 
            *ngIf="config.showReset"
            label="Réinitialiser" 
            icon="pi pi-refresh"
            (click)="onResetFilters()"
            class="p-button-outlined me-2"
            severity="secondary">
          </p-button>

          <p-button 
            label="Effacer" 
            icon="pi pi-times"
            (click)="onClearFilters()"
            class="p-button-outlined"
            severity="secondary">
          </p-button>
        </div>

        <!-- Active Filters Display -->
        <div *ngIf="hasActiveFilters()" class="active-filters mt-3">
          <h6>Filtres actifs:</h6>
          <div class="filter-chips">
            <p-chip 
              *ngFor="let activeFilter of getActiveFilters(); trackBy: trackByActiveFilter" 
              [label]="activeFilter.label + ': ' + activeFilter.value"
              [removable]="true"
              (onRemove)="removeFilter(activeFilter.key)"
              class="filter-chip me-2 mb-2">
            </p-chip>
          </div>
        </div>
      </div>
    </p-panel>
  `,
  styles: [`
    .filter-panel {
      margin-bottom: 1rem;
    }

    .filter-container {
      padding: 1rem;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-button {
      flex-shrink: 0;
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
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .field-container {
      width: 100%;
    }

    .date-range-container {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
    }

    .date-range-container > div {
      flex: 1;
    }

    .field-label {
      display: block;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .required {
      color: #e74c3c;
      margin-left: 0.25rem;
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .active-filters {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid #e9ecef;
      margin-top: 1rem;
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .filter-chip {
      font-size: 0.875rem;
    }

    .slider-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #6c757d;
    }

    @media (max-width: 768px) {
      .filter-container {
        padding: 0.75rem;
      }

      .search-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-button {
        margin-top: 0.5rem;
      }

      .layout-horizontal {
        flex-direction: column;
        align-items: stretch;
      }

      .layout-grid {
        grid-template-columns: 1fr;
      }

      .date-range-container {
        flex-direction: column;
      }

      .filter-actions {
        flex-direction: column;
      }

      .filter-actions .p-button {
        width: 100%;
        margin-bottom: 0.5rem;
      }

      .filter-chips {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    CheckboxModule,
    ButtonModule,
    ChipModule,
    MultiSelectModule,
    SliderModule,
    PanelModule
  ]
})
export class FilterPrimeComponent implements OnInit, OnChanges {
  @Input() config: FilterConfig = {
    fields: [],
    showReset: true,
    showSearch: true,
    searchPlaceholder: 'Rechercher...',
    layout: 'vertical',
    collapsible: false,
    collapsed: false
  };

  @Input() initialValues: FilterValues = {};
  @Input() title: string = 'Filtres';

  @Output() filterChange = new EventEmitter<FilterValues>();
  @Output() search = new EventEmitter<string>();

  filterForm: FormGroup;
  searchTerm: string = '';
  isCollapsed: boolean = false;

  constructor(private formBuilder: FormBuilder) {
    this.filterForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
    this.isCollapsed = this.config.collapsed || false;
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
        formGroup[field.key + '_start'] = new FormControl(this.initialValues[field.key + '_start'] || null);
        formGroup[field.key + '_end'] = new FormControl(this.initialValues[field.key + '_end'] || null);
      } else if (field.type === 'slider') {
        formGroup[field.key] = new FormControl(
          this.initialValues[field.key] || [field.min || 0, field.max || 100]
        );
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
    const max = field.max ?? 100;
    
    switch (field.type) {
      case 'boolean':
        return false;
      case 'number':
        return min;
      case 'slider':
        return [min, max];
      case 'select':
      case 'multiselect':
      case 'text':
      case 'date':
      default:
        return null;
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
    return field.type === 'daterange' ? 'field-full-width' : '';
  }

  trackByField(index: number, field: FilterField): string {
    return field.key;
  }

  trackByActiveFilter(index: number, filter: { key: string; label: string; value: string }): string {
    return filter.key;
  }

  onSearch(): void {
    const trimmedSearch = this.searchTerm?.trim();
    this.search.emit(trimmedSearch);
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
      } else if (formValue[field.key] !== null && formValue[field.key] !== undefined && formValue[field.key] !== '') {
        processedValue[field.key] = formValue[field.key];
      }
    });

    this.filterChange.emit(processedValue);
  }

  onResetFilters(): void {
    this.filterForm.reset();
    this.searchTerm = '';
    
    const resetValues: FilterValues = {};
    this.config.fields.forEach(field => {
      if (field.type === 'daterange') {
        resetValues[field.key + '_start'] = null;
        resetValues[field.key + '_end'] = null;
      } else {
        resetValues[field.key] = this.getDefaultValue(field);
      }
    });
    
    this.filterForm.patchValue(resetValues);
    this.filterChange.emit({});
  }

  onClearFilters(): void {
    this.filterForm.reset();
    this.searchTerm = '';
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
          const start = formValue[startKey] ? new Date(formValue[startKey]).toLocaleDateString() : '';
          const end = formValue[endKey] ? new Date(formValue[endKey]).toLocaleDateString() : '';
          activeFilters.push({
            key: field.key,
            label: field.label,
            value: start && end ? `${start} - ${end}` : (start || end)
          });
        }
      } else if (formValue[field.key] && formValue[field.key] !== '' && formValue[field.key] !== null) {
        let displayValue = formValue[field.key];
        
        if (field.type === 'select' && field.options) {
          const option = field.options.find(opt => opt.value === formValue[field.key]);
          displayValue = option ? option.label : formValue[field.key];
        } else if (field.type === 'multiselect' && Array.isArray(formValue[field.key])) {
          displayValue = formValue[field.key].map((val: any) => {
            const option = field.options?.find(opt => opt.value === val);
            return option ? option.label : val;
          }).join(', ');
        } else if (field.type === 'boolean') {
          displayValue = formValue[field.key] ? 'Oui' : 'Non';
        } else if (field.type === 'slider' && Array.isArray(formValue[field.key])) {
          displayValue = `${formValue[field.key][0]} - ${formValue[field.key][1]}`;
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
        [baseKey + '_start']: null,
        [baseKey + '_end']: null
      });
    } else {
      const field = this.config.fields.find(f => f.key === key);
      this.filterForm.patchValue({ 
        [key]: this.getDefaultValue(field || {} as FilterField) 
      });
    }
    
    this.onApplyFilters();
  }
}
