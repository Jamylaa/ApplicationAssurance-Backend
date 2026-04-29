import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { MessageService, ConfirmationService } from 'primeng/api';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  style?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

@Component({
  selector: 'app-example-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToolbarModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    BadgeModule,
    RippleModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="card">
      <p-table
        #dt
        [value]="users"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        [loading]="loading"
        [globalFilterFields]="['name', 'email', 'role', 'status']"
        [tableStyle]="{ 'min-width': '60rem' }"
        styleClass="p-datatable-gridlines p-datatable-striped"
        [sortMode]="'multiple'"
        dataKey="id"
        stateKey="table-state"
        stateStorage="session">

        <ng-template pTemplate="caption">
          <div class="table-header">
            <div class="table-title">
              <h5 class="mb-0">Gestion des Utilisateurs</h5>
              <span class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <input
                  pInputText
                  type="text"
                  (input)="onGlobalFilter($event)"
                  placeholder="Rechercher..."
                  class="search-input"
                  tooltipPosition="top"
                  pTooltip="Filtrer les resultats" />
              </span>
            </div>
            <div class="table-actions">
              <button
                pButton
                label="Nouveau"
                icon="pi pi-plus"
                class="p-button-success me-2"
                (click)="openNewDialog()"
                tooltipPosition="left"
                pTooltip="Creer un nouvel utilisateur">
              </button>
              <button
                pButton
                label="Exporter"
                icon="pi pi-download"
                class="p-button-secondary"
                (click)="exportData()"
                tooltipPosition="left"
                pTooltip="Telecharger les donnees">
              </button>
            </div>
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name" style="min-width: 200px">
              Nom
              <p-sortIcon field="name"></p-sortIcon>
            </th>
            <th pSortableColumn="email" style="min-width: 220px">
              Email
              <p-sortIcon field="email"></p-sortIcon>
            </th>
            <th pSortableColumn="role" style="min-width: 120px">
              Role
              <p-sortIcon field="role"></p-sortIcon>
            </th>
            <th pSortableColumn="status" style="min-width: 100px">
              Statut
              <p-sortIcon field="status"></p-sortIcon>
            </th>
            <th pSortableColumn="createdAt" style="min-width: 140px">
              Date Creation
              <p-sortIcon field="createdAt"></p-sortIcon>
            </th>
            <th style="width: 140px">Actions</th>
          </tr>
          <tr>
            <th>
              <input
                pInputText
                type="text"
                (input)="onColumnFilter(dt, 'name', $event)"
                placeholder="Filtrer par nom"
                class="filter-input" />
            </th>
            <th>
              <input
                pInputText
                type="text"
                (input)="onColumnFilter(dt, 'email', $event)"
                placeholder="Filtrer par email"
                class="filter-input" />
            </th>
            <th>
              <p-columnFilter type="text" field="role" matchMode="equals">
                <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                  <p-dropdown
                    [ngModel]="value"
                    [options]="roles"
                    (onChange)="filter($event.value)"
                    placeholder="Tous"
                    optionLabel="label"
                    optionValue="value">
                  </p-dropdown>
                </ng-template>
              </p-columnFilter>
            </th>
            <th>
              <p-columnFilter type="text" field="status" matchMode="equals">
                <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                  <p-dropdown
                    [ngModel]="value"
                    [options]="statusOptions"
                    (onChange)="filter($event.value)"
                    placeholder="Tous"
                    optionLabel="label"
                    optionValue="value">
                  </p-dropdown>
                </ng-template>
              </p-columnFilter>
            </th>
            <th></th>
            <th></th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-user>
          <tr>
            <td>
              <div class="user-cell">
                <div class="user-avatar">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <span class="user-name">{{ user.name }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <p-tag
                [value]="user.role"
                [severity]="getRoleSeverity(user.role)">
              </p-tag>
            </td>
            <td>
              <p-tag
                [value]="user.status === 'active' ? 'Actif' : 'Inactif'"
                [severity]="user.status === 'active' ? 'success' : 'danger'">
              </p-tag>
            </td>
            <td>{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
            <td>
              <div class="action-buttons">
                <button
                  pButton
                  pRipple
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-primary p-button-sm me-1"
                  (click)="editUser(user)"
                  pTooltip="Modifier"
                  tooltipPosition="top">
                </button>
                <button
                  pButton
                  pRipple
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-info p-button-sm me-1"
                  (click)="viewUser(user)"
                  pTooltip="Voir details"
                  tooltipPosition="top">
                </button>
                <button
                  pButton
                  pRipple
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-sm"
                  (click)="deleteUser(user)"
                  pTooltip="Supprimer"
                  tooltipPosition="top">
                </button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center py-5">
              <div class="empty-state">
                <i class="pi pi-inbox" style="font-size: 3rem; color: #adb5bd;"></i>
                <h6 class="mt-3 mb-2">Aucune donnee disponible</h6>
                <p class="text-muted">Commencez par ajouter un nouvel utilisateur</p>
                <button
                  pButton
                  label="Ajouter un utilisateur"
                  icon="pi pi-plus"
                  class="p-button-primary mt-3"
                  (click)="openNewDialog()">
                </button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="summary">
          <div class="table-summary">
            Total: <strong>{{ users?.length }}</strong> utilisateur(s)
          </div>
        </ng-template>
      </p-table>
    </div>

    <!-- User Dialog -->
    <p-dialog
      [(visible)]="userDialog"
      [header]="dialogHeader"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="user-dialog">

      <div class="p-fluid p-formgrid p-grid">
        <div class="p-field p-col-12">
          <label for="name">Nom Complet</label>
          <input
            pInputText
            id="name"
            [(ngModel)]="user.name"
            required
            autofocus
            class="form-input" />
        </div>

        <div class="p-field p-col-12">
          <label for="email">Email</label>
          <input
            pInputText
            id="email"
            type="email"
            [(ngModel)]="user.email"
            required
            class="form-input" />
        </div>

        <div class="p-field p-col-12 p-md-6">
          <label for="role">Role</label>
          <p-dropdown
            id="role"
            [options]="roles"
            [(ngModel)]="user.role"
            optionLabel="label"
            optionValue="value"
            placeholder="Selectionner un role">
          </p-dropdown>
        </div>

        <div class="p-field p-col-12 p-md-6">
          <label for="status">Statut</label>
          <p-dropdown
            id="status"
            [options]="statusOptions"
            [(ngModel)]="user.status"
            optionLabel="label"
            optionValue="value"
            placeholder="Selectionner un statut">
          </p-dropdown>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button
          pButton
          label="Annuler"
          icon="pi pi-times"
          class="p-button-text"
          (click)="hideDialog()">
        </button>
        <button
          pButton
          label="Enregistrer"
          icon="pi pi-check"
          class="p-button-success"
          (click)="saveUser()">
        </button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .table-title {
      display: flex;
      align-items: center;
      gap: 1rem;

      h5 {
        margin: 0;
        font-weight: 600;
        color: #212529;
      }
    }

    .table-actions {
      display: flex;
      gap: 0.5rem;
    }

    .search-input {
      width: 300px;
    }

    .filter-input {
      width: 100%;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
    }

    .user-name {
      font-weight: 500;
      color: #212529;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
    }

    .empty-state {
      padding: 2rem;
    }

    .table-summary {
      padding: 0.5rem;
      color: #6c757d;
    }

    .form-input {
      width: 100%;
    }

    .p-dialog.user-dialog :host ::ng-deep .p-dialog-header {
      border-bottom: 2px solid #dee2e6;
    }

    :host ::ng-deep {
      .p-datatable {
        .p-datatable-thead > tr > th {
          background: #f8f9fa;
          color: #495057;
          font-weight: 600;
          border-bottom: 2px solid #dee2e6;
          padding: 1rem;
        }

        .p-datatable-tbody > tr > td {
          padding: 1rem;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }

        .p-datatable-tbody > tr:hover {
          background: #f8f9fa !important;
        }

        .p-datatable-tbody > tr:nth-child(even) {
          background: #fafafa;
        }
      }

      .p-paginator {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 0 0 12px 12px;
      }
    }
  `]
})
export class ExampleTableComponent implements OnInit {
  users: User[] = [];
  user: User = this.emptyUser();
  userDialog = false;
  dialogHeader = '';
  loading = true;
  roles = [
    { label: 'Administrateur', value: 'ADMIN' },
    { label: 'Utilisateur', value: 'USER' },
    { label: 'Moderateur', value: 'MODERATOR' }
  ];
  statusOptions = [
    { label: 'Actif', value: 'active' },
    { label: 'Inactif', value: 'inactive' }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    setTimeout(() => {
      this.users = [
        { id: 1, name: 'Rihab Mansour', email: 'rihab@vermeg.com', role: 'ADMIN', status: 'active', createdAt: new Date('2024-01-15') },
        { id: 2, name: 'Ahmed Ben Ali', email: 'ahmed@vermeg.com', role: 'USER', status: 'active', createdAt: new Date('2024-02-20') },
        { id: 3, name: 'Sarra Trabelsi', email: 'sarra@vermeg.com', role: 'MODERATOR', status: 'active', createdAt: new Date('2024-03-10') },
        { id: 4, name: 'Mohamed Khelifi', email: 'mohamed@vermeg.com', role: 'USER', status: 'inactive', createdAt: new Date('2024-04-05') },
        { id: 5, name: 'Fatma Hamdi', email: 'fatma@vermeg.com', role: 'ADMIN', status: 'active', createdAt: new Date('2024-05-12') },
      ];
      this.loading = false;
    }, 1000);
  }

  emptyUser(): User {
    return {
      id: 0,
      name: '',
      email: '',
      role: '',
      status: 'active',
      createdAt: new Date()
    };
  }

  onGlobalFilter(event: Event) {
    const table = event.target as HTMLInputElement;
    // Implement global filter logic
  }

  onColumnFilter(table: any, field: string, event: Event) {
    // Implement column filter logic
  }

  openNewDialog() {
    this.user = this.emptyUser();
    this.dialogHeader = 'Nouvel Utilisateur';
    this.userDialog = true;
  }

  editUser(user: User) {
    this.user = { ...user };
    this.dialogHeader = 'Modifier Utilisateur';
    this.userDialog = true;
  }

  viewUser(user: User) {
    this.user = { ...user };
    this.dialogHeader = 'Details Utilisateur';
    this.userDialog = true;
  }

  hideDialog() {
    this.userDialog = false;
  }

  saveUser() {
    if (this.user.name && this.user.email) {
      this.messageService.add({
        severity: 'success',
        summary: 'Succes',
        detail: 'Utilisateur enregistre avec succes',
        life: 3000
      });
      this.hideDialog();
      this.loadUsers();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires',
        life: 3000
      });
    }
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer cet utilisateur ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: 'Utilisateur supprime',
          life: 3000
        });
      }
    });
  }

  exportData() {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Telechargement des donnees...',
      life: 2000
    });
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'MODERATOR': return 'warning';
      default: return 'info';
    }
  }
}