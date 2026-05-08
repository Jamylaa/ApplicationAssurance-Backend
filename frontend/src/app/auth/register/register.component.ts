import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GestionUserService, RegisterRequest } from '../../services/gestion-user.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = '';
  loading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: GestionUserService,
    private readonly router: Router
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
    if (!this.registerForm.valid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const payload: RegisterRequest = {
      username: String(this.registerForm.value.username ?? ''),
      email: String(this.registerForm.value.email ?? ''),
      password: String(this.registerForm.value.password ?? ''),
      phone: Number(this.registerForm.value.phone ?? 0),
      departement: String(this.registerForm.value.departement ?? 'IT')
    };

    this.userService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Erreur lors de la création du compte';
      }
    });
  }
}
