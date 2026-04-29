import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { GestionUserService, User } from '../../services/gestion-user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    BadgeModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  globalFilterValue = '';

  constructor(
    private userService: GestionUserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: `${data.length} utilisateurs charges`
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des utilisateurs'
        });
        console.error('Error loading users:', error);
      }
    });
  }

  deleteUser(user: User): void {
    if (!user.idUser) return;

    this.confirmationService.confirm({
      message: `Etes-vous sur de vouloir supprimer l'utilisateur ${user.userName}?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user.idUser!).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.idUser !== user.idUser);
            this.messageService.add({
              severity: 'success',
              summary: 'Succes',
              detail: 'Utilisateur supprime avec succes'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la suppression de l\'utilisateur'
            });
            console.error('Error deleting user:', error);
          }
        });
      }
    });
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.globalFilterValue = target.value;
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  getDepartementBadgeClass(departement?: string): string {
    if (!departement) return 'p-badge-secondary';
    const dept = departement.toLowerCase();
    switch (dept) {
      case 'it':
      case 'informatique':
        return 'p-badge-info';
      case 'finance':
      case 'comptabilite':
        return 'p-badge-success';
      case 'rh':
      case 'ressources humaines':
        return 'p-badge-warning';
      case 'marketing':
        return 'p-badge-danger';
      default:
        return 'p-badge-secondary';
    }
  }

  getBadgeSeverity(departement?: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    if (!departement) return 'secondary';
    const dept = departement.toLowerCase();
    switch (dept) {
      case 'it':
      case 'informatique':
        return 'info';
      case 'finance':
      case 'comptabilite':
        return 'success';
      case 'rh':
      case 'ressources humaines':
        return 'warning';
      case 'marketing':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}