import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminService, Admin } from '../../core/services/admin.service';
import { Router, RouterLink } from '@angular/router';
import { DividerModule } from 'primeng/divider';
import { ButtonDirective } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { NgIf } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, InputTextModule, NgIf, PasswordModule, MessageModule, ButtonDirective, DividerModule, RouterLink]
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(7)]],
      phone: ['', Validators.required],
      departement: ['IT', Validators.required] 
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      // Créer un admin avec les données du formulaire
      const adminData: Admin = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        phone: this.registerForm.value.phone,
        departement: this.registerForm.value.departement,
        role: 'ADMIN'
      };
      
      this.adminService.createAdmin(adminData).subscribe({
        next: () => {
          console.log('â£ Admin crÃ©Ã© avec succÃ¨s');
          this.router.navigate(['/auth/login']);
        },
        error: (error: any) => {
          console.error('â Erreur crÃ©ation admin:', error);
          this.error = 'Erreur lors de la crÃ©ation administrateur';
        }
      });
    }
  }
}
