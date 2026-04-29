import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BadgeModule } from 'primeng/badge';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService, ConfirmationService } from 'primeng/api';
import { GestionUserService, User } from '../../services/gestion-user.service';

@Component({
  selector: 'app-users-clean',
  templateUrl: './users.component.clean.html',
  styleUrls: ['./users.component.clean.css'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    BadgeModule,
    DropdownModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class UsersComponentClean implements OnInit {
  users: User[] = [];
  loading = false;
  globalFilterValue = '';
  selectedUsers: User[] = [];
  
  // Options pour les filtres
  departmentOptions = [
    { label: 'Tous', value: null },
    { label: 'IT', value: 'IT' },
    { label: 'Finance', value: 'Finance' },
    { label: 'RH', value: 'RH' },
    { label: 'Marketing', value: 'Marketing' }
  ];

  selectedDepartment: any = null;

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
          summary: 'Succès',
          detail: `${data.length} utilisateurs chargés`
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
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.userName}?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user.idUser!).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.idUser !== user.idUser);
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateur supprimé avec succès'
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

  deleteSelectedUsers(): void {
    if (this.selectedUsers.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner au moins un utilisateur'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer les ${this.selectedUsers.length} utilisateurs sélectionnés?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Simuler la suppression multiple
        const deletedCount = this.selectedUsers.length;
        this.users = this.users.filter(user => 
          !this.selectedUsers.some(selected => selected.idUser === user.idUser)
        );
        this.selectedUsers = [];
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `${deletedCount} utilisateurs supprimés avec succès`
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
      case 'comptabilité':
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

  exportUsers(): void {
    // Simuler l'exportation
    this.messageService.add({
      severity: 'info',
      summary: 'Exportation',
      detail: 'Exportation des utilisateurs en cours...'
    });
  }

  addUser(): void {
    // Simuler l'ajout d'utilisateur
    this.messageService.add({
      severity: 'info',
      summary: 'Ajout',
      detail: 'Fonctionnalité d\'ajout à implémenter'
    });
  }

  editUser(user: User): void {
    // Simuler l'édition d'utilisateur
    this.messageService.add({
      severity: 'info',
      summary: 'Édition',
      detail: `Édition de l'utilisateur ${user.userName} à implémenter`
    });
  }
}
