import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Router, RouterLink } from '@angular/router';
import { DividerModule } from 'primeng/divider';
import { ButtonDirective } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { NgIf } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: true,
    imports: [CardModule, FormsModule, ReactiveFormsModule, InputTextModule, NgIf, PasswordModule, MessageModule, ButtonDirective, DividerModule, RouterLink]
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$')]],
      password: ['', [Validators.required, Validators.minLength(7)]]
    });
  }
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.error = '';
      console.log('🔐 Tentative de login avec:', this.loginForm.value);
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          console.log('✅ Réponse de login reçue:', res);
          const currentUser = this.authService.currentUserValue;
          
          if (!currentUser) {
            this.error = 'Réponse serveur invalide - utilisateur non trouvé';
            console.error('❌ Erreur: currentUser null après login');
            return;
          }
          
          console.log('✅ Login réussi, redirection vers dashboard...');
          // Rediriger tous les utilisateurs vers le dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          console.error('❌ Erreur de login:', err);
          this.error = err.error?.message || err.message || 'Identifiants invalides';
          
          // Messages d'erreur détaillés
          if (err.status === 0) {
            this.error = 'Serveur inaccessible - Vérifiez que le backend GestionUser est démarré (port 9092)';
          } else if (err.status === 401) {
            this.error = 'Identifiants incorrects';
          } else if (err.status === 500) {
            this.error = 'Erreur serveur - Contactez l\'administrateur';
          }
        }
      });
    }
  }
}