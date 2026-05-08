import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GestionUserService } from '../../services/gestion-user.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CardModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    ButtonModule,
    DividerModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';
  loading = false;
  usernameFocused = false;
  passwordFocused = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: GestionUserService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$')]],
      password: ['', [Validators.required, Validators.minLength(7)]]
    });
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (!res?.token || !res?.utilisateur) {
          this.error = 'Réponse serveur invalide';
          this.loading = false;
          return;
        }

        // Store token and user data in localStorage
        localStorage.setItem('token', res.token);
        localStorage.setItem('currentUser', JSON.stringify(res.utilisateur));

        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Identifiants invalides';

        if (err?.status === 0) {
          this.error = 'Serveur inaccessible';
        } else if (err?.status === 401) {
          this.error = 'Identifiants incorrects';
        }
      }
    });
  }
}
