import { Component, Input, Output, EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputMaskModule } from 'primeng/inputmask';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'date' | 'dropdown' | 'multiselect' | 'mask';
  placeholder?: string;
  required?: boolean;
  options?: any[];
  mask?: string;
}

@Component({
  selector: 'app-enhanced-form',
  templateUrl: './enhanced-form.component.html',
  styleUrls: ['./enhanced-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MessageModule, 
    ButtonModule, 
    InputTextModule, 
    FloatLabelModule, 
    PasswordModule, 
    CalendarModule, 
    DropdownModule, 
    MultiSelectModule, 
    AutoCompleteModule, 
    InputMaskModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class EnhancedFormComponent {
  @Input() formGroup: FormGroup = new FormGroup({});
  @Input() submitLabel: string = 'Enregistrer';
  @Input() showValidationErrors: boolean = true;
  @Input() loading: boolean = false;
  @Input() formFields: FormField[] = [];
  
  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  submit(): void {
    if (this.formGroup.valid) {
      this.onSubmit.emit(this.formGroup.value);
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.formGroup.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';
    
    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['email']) return 'Format d\'email invalide';
    if (errors['minlength']) return `Minimum ${errors['minlength']['requiredLength']} caractères`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength']['requiredLength']} caractères`;
    if (errors['pattern']) return 'Format invalide';
    
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.formGroup.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.formGroup.get(fieldName);
    return field ? field.valid && field.touched : false;
  }
}
