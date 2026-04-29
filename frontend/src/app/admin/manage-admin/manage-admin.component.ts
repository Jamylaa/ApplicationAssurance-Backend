import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { DropdownModule } from 'primeng/dropdown';
import { ColumnFilterModule } from 'primeng/columnfilter';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { MessageService, ConfirmationService, FilterService, FilterMatchMode } from 'primeng/api';

import { AdminService, Admin } from '../../core/services/admin.service';
import { AuthService } from '../../core/auth.service';

interface StatusOption {
  label: string;
  value: boolean;
}

interface DepartementOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-manage-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    TagModule,
    RippleModule,
    DropdownModule,
    ColumnFilterModule,
    InputMaskModule,
    CheckboxModule,
    PasswordModule
  ],
  providers: [MessageService, ConfirmationService, FilterService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h4 class="page-title">Gestion des Administrateurs</h4>
          <p class="page-subtitle">Gerer les comptes administrateurs du systeme</p>
        </div>
        <button
          pButton
          label="Nouvel Administrateur"
          icon="pi pi-plus"
          class="p-button-primary"
          (click)="openNewDialog()"
          pTooltip="Creer un nouvel administrateur">
        </button>
      </div>

      <!-- Data Table Card -->
      <div class="card">
        <p-table
          #dt
          [value]="admins"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 25, 50]"
          [loading]="loading"
          [globalFilterFields]="['username', 'email', 'phone', 'departement', 'actif']"
          [tableStyle]="{ 'min-width': '75rem' }"
          styleClass="p-datatable-gridlines p-datatable-striped"
          [sortMode]="'multiple'"
          dataKey="idUser"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} enregistrements"
          [stateStorage]="'session'"
          [stateKey]="'admin-table-state'">

          <ng-template pTemplate="caption">
            <div class="table-caption">
              <div class="search-container">
                <span class="p-input-icon-left">
                  <i class="pi pi-search"></i>
                  <input
                    pInputText
                    type="text"
                    (input)="onGlobalFilter($event)"
                    placeholder="Rechercher un administrateur..."
                    class="search-input" />
                </span>
              </div>
              <div class="table-actions">
                <button
                  pButton
                  icon="pi pi-refresh"
                  class="p-button-secondary p-button-outlined"
                  (click)="loadAdmins()"
                  pTooltip="Actualiser"
                  tooltipPosition="left">
                </button>
                <button
                  pButton
                  icon="pi pi-download"
                  class="p-button-secondary p-button-outlined"
                  (click)="exportData()"
                  pTooltip="Exporter en CSV"
                  tooltipPosition="left">
                </button>
              </div>
            </div>
          </ng-template>

          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="username" style="min-width: 200px">
                Nom d'utilisateur
                <p-sortIcon field="username"></p-sortIcon>
                <p-columnFilter type="text" field="username" matchMode="contains" display="menu"></p-columnFilter>
              </th>
              <th pSortableColumn="email" style="min-width: 240px">
                Email
                <p-sortIcon field="email"></p-sortIcon>
                <p-columnFilter type="text" field="email" matchMode="contains" display="menu"></p-columnFilter>
              </th>
              <th pSortableColumn="phone" style="min-width: 140px">
                Telephone
                <p-sortIcon field="phone"></p-sortIcon>
              </th>
              <th pSortableColumn="departement" style="min-width: 160px">
                Departement
                <p-sortIcon field="departement"></p-sortIcon>
                <p-columnFilter type="text" field="departement" matchMode="equals" display="menu"></p-columnFilter>
              </th>
              <th pSortableColumn="actif" style="min-width: 100px">
                Statut
                <p-sortIcon field="actif"></p-sortIcon>
                <p-columnFilter type="boolean" field="actif" display="menu"></p-columnFilter>
              </th>
              <th pSortableColumn="dateCreation" style="min-width: 140px">
                Date Creation
                <p-sortIcon field="dateCreation"></p-sortIcon>
              </th>
              <th style="width: 160px">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-admin>
            <tr>
              <td>
                <div class="user-cell">
                  <div class="user-avatar" [class.inactive]="!admin.actif">
                    {{ admin.username?.charAt(0).toUpperCase() }}
                  </div>
                  <span class="user-name">{{ admin.username }}</span>
                </div>
              </td>
              <td>{{ admin.email }}</td>
              <td>{{ admin.phone }}</td>
              <td>
                <p-tag
                  [value]="admin.departement || 'Non defini'"
                  severity="info">
                </p-tag>
              </td>
              <td>
                <p-tag
                  [value]="admin.actif ? 'Actif' : 'Inactif'"
                  [severity]="admin.actif ? 'success' : 'danger'"
                  styleClass="status-tag">
                </p-tag>
              </td>
              <td>{{ admin.dateCreation | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    pButton
                    pRipple
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-primary p-button-sm"
                    (click)="editAdmin(admin)"
                    pTooltip="Modifier"
                    tooltipPosition="top">
                  </button>
                  <button
                    pButton
                    pRipple
                    icon="pi pi-eye"
                    class="p-button-rounded p-button-info p-button-sm"
                    (click)="viewAdmin(admin)"
                    pTooltip="Voir details"
                    tooltipPosition="top">
                  </button>
                  <button
                    pButton
                    pRipple
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-danger p-button-sm"
                    (click)="deleteAdmin(admin)"
                    [disabled]="isCurrentUser(admin)"
                    pTooltip="{{ isCurrentUser(admin) ? 'Vous ne pouvez pas vous supprimer' : 'Supprimer' }}"
                    tooltipPosition="top">
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center py-5">
                <div class="empty-state">
                  <i class="pi pi-users" style="font-size: 3rem; color: #adb5bd;"></i>
                  <h6 class="mt-3 mb-2">Aucun administrateur trouve</h6>
                  <p class="text-muted mb-3">Commencez par ajouter un nouvel administrateur</p>
                  <button
                    pButton
                    label="Ajouter un administrateur"
                    icon="pi pi-plus"
                    class="p-button-primary"
                    (click)="openNewDialog()">
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="loading">
            <tr>
              <td colspan="7" class="text-center py-5">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #adb5bd;"></i>
                <p class="mt-2 text-muted">Chargement des donnees...</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Admin Dialog -->
    <p-dialog
      [(visible)]="adminDialog"
      [header]="dialogHeader"
      [modal]="true"
      [style]="{ width: '550px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="admin-dialog"
      [breakpoints]="{'960px': '75vw'}">

      <ng-template pTemplate="content">
        <form [formGroup]="adminForm" class="admin-form">
          <div class="p-fluid p-formgrid p-grid">
            <div class="p-field p-col-12">
              <label for="username" class="form-label">Nom d'utilisateur <span class="required">*</span></label>
              <input
                pInputText
                id="username"
                formControlName="username"
                placeholder="Ex: rihab.mansour"
                class="form-input"
                [class.ng-invalid]="adminForm.get('username')?.invalid && adminForm.get('username')?.touched" />
              <small class="p-error" *ngIf="adminForm.get('username')?.invalid && adminForm.get('username')?.touched">
                Le nom d'utilisateur est requis (3-30 caracteres, lettres et tirets uniquement)
              </small>
            </div>

            <div class="p-field p-col-12">
              <label for="email" class="form-label">Email <span class="required">*</span></label>
              <input
                pInputText
                id="email"
                type="email"
                formControlName="email"
                class="form-input"
                [class.ng-invalid]="adminForm.get('email')?.invalid && adminForm.get('email')?.touched" />
              <small class="p-error" *ngIf="adminForm.get('email')?.invalid && adminForm.get('email')?.touched">
                Une adresse email valide est requise
              </small>
            </div>

            <div class="p-field p-col-12 p-md-6">
              <label for="phone" class="form-label">Telephone <span class="required">*</span></label>
              <p-inputMask
                id="phone"
                formControlName="phone"
                mask="99 999 999"
                placeholder="XX XXX XXX"
                styleClass="form-input"
                [class.ng-invalid]="adminForm.get('phone')?.invalid && adminForm.get('phone')?.touched">
              </p-inputMask>
              <small class="p-error" *ngIf="adminForm.get('phone')?.invalid && adminForm.get('phone')?.touched">
                Le numero de telephone est requis
              </small>
            </div>

            <div class="p-field p-col-12 p-md-6">
              <label for="departement" class="form-label">Departement</label>
              <p-dropdown
                id="departement"
                formControlName="departement"
                [options]="departements"
                optionLabel="label"
                optionValue="value"
                placeholder="Selectionner"
                styleClass="form-dropdown">
              </p-dropdown>
            </div>

            <div class="p-field p-col-12" *ngIf="isNewAdmin">
              <label for="password" class="form-label">Mot de passe <span class="required">*</span></label>
              <p-password
                id="password"
                formControlName="password"
                placeholder="Minimum 6 caracteres"
                [toggleMask]="true"
                styleClass="form-password"
                [feedback]="true"
                [class.ng-invalid]="adminForm.get('password')?.invalid && adminForm.get('password')?.touched">
              </p-password>
              <small class="p-error" *ngIf="adminForm.get('password')?.invalid && adminForm.get('password')?.touched">
                Le mot de passe est requis (minimum 6 caracteres)
              </small>
            </div>

            <div class="p-field p-col-12">
              <div class="checkbox-field">
                <p-checkbox
                  id="actif"
                  formControlName="actif"
                  [binary]="true"
                  inputId="actif">
                </p-checkbox>
                <label for="actif" class="checkbox-label">Compte actif</label>
              </div>
            </div>
          </div>
        </form>
      </ng-template>

      <ng-template pTemplate="footer">
        <button
          pButton
          type="button"
          label="Annuler"
          icon="pi pi-times"
          class="p-button-text"
          (click)="hideDialog()">
        </button>
        <button
          pButton
          type="button"
          label="Enregistrer"
          icon="pi pi-check"
          class="p-button-success"
          (click)="saveAdmin()"
          [loading]="saving"
          [disabled]="adminForm.invalid">
        </button>
      </ng-template>
    </p-dialog>

    <!-- View Dialog -->
    <p-dialog
      [(visible)]="viewDialog"
      header="Details Administrateur"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
      [resizable]="false">

      <ng-template pTemplate="content">
        <div class="view-details" *ngIf="selectedAdmin">
          <div class="detail-row">
            <span class="detail-label">Nom d'utilisateur</span>
            <span class="detail-value">{{ selectedAdmin.username }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">{{ selectedAdmin.email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Telephone</span>
            <span class="detail-value">{{ selectedAdmin.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Departement</span>
            <span class="detail-value">{{ selectedAdmin.departement || 'Non defini' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Statut</span>
            <p-tag
              [value]="selectedAdmin.actif ? 'Actif' : 'Inactif'"
              [severity]="selectedAdmin.actif ? 'success' : 'danger'">
            </p-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date de creation</span>
            <span class="detail-value">{{ selectedAdmin.dateCreation | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <button
          pButton
          label="Fermer"
          icon="pi pi-times"
          class="p-button-text"
          (click)="viewDialog = false">
        </button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-container {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      margin: 0;
      font-weight: 600;
      color: #212529;
      font-size: 1.5rem;
    }

    .page-subtitle {
      margin: 0.25rem 0 0 0;
      color: #6c757d;
      font-size: 0.875rem;
    }

    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
    }

    .table-caption {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .search-container {
      flex: 1;
      max-width: 400px;
    }

    .search-input {
      width: 100%;
    }

    .table-actions {
      display: flex;
      gap: 0.5rem;
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

      &.inactive {
        background: linear-gradient(135deg, #adb5bd 0%, #868e96 100%);
      }
    }

    .user-name {
      font-weight: 500;
      color: #212529;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .empty-state {
      padding: 2rem;
    }

    .admin-form {
      padding: 0.5rem 0;
    }

    .form-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #495057;
    }

    .required {
      color: #dc3545;
    }

    .form-input {
      width: 100%;
    }

    .form-dropdown {
      width: 100%;
    }

    .form-password {
      width: 100%;
    }

    :host ::ng-deep .form-password input {
      width: 100%;
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox-label {
      margin: 0;
      color: #495057;
    }

    .view-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #dee2e6;

      &:last-child {
        border-bottom: none;
      }
    }

    .detail-label {
      font-weight: 500;
      color: #6c757d;
    }

    .detail-value {
      color: #212529;
    }

    :host ::ng-deep {
      .p-datatable {
        .p-datatable-header {
          background: transparent;
          border: none;
          padding: 0 0 1rem 0;
        }

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

        .p-datatable-tbody > tr:nth-child(even):hover {
          background: #f0f0f0 !important;
        }
      }

      .p-paginator {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 0 0 12px 12px;
        border-top: none;
      }

      .admin-dialog .p-dialog-header {
        border-bottom: 2px solid #dee2e6;
      }

      .status-tag {
        font-size: 0.75rem;
      }
    }
  `]
})
export class ManageAdminComponent implements OnInit {
  @ViewChild('dt') table!: Table;

  admins: Admin[] = [];
  selectedAdmins: Admin[] = [];
  admin: Admin = this.emptyAdmin();
  selectedAdmin: Admin | null = null;

  adminDialog = false;
  viewDialog = false;
  saving = false;
  loading = true;
  isNewAdmin = true;
  dialogHeader = '';

  adminForm!: FormGroup;

  departements: DepartementOption[] = [
    { label: 'Informatique', value: 'Informatique' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'RH', value: 'RH' },
    { label: 'Technique', value: 'Technique' },
    { label: 'Direction', value: 'Direction' }
  ];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadAdmins();
  }

  initForm() {
    this.adminForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+(-[a-zA-Z]+)*$'), Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9 ]{8,}$')]],
      departement: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      actif: [true]
    });
  }

  loadAdmins() {
    this.loading = true;
    this.adminService.getAllAdmins().subscribe({
      next: (data) => {
        this.admins = data;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les administrateurs',
          life: 3000
        });
      }
    });
  }

  emptyAdmin(): Admin {
    return {
      userName: '',
      email: '',
      phone: 0,
      departement: '',
      actif: true
    };
  }

  onGlobalFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.table?.filterGlobal(value, 'contains');
  }

  openNewDialog() {
    this.isNewAdmin = true;
    this.dialogHeader = 'Nouvel Administrateur';
    this.admin = this.emptyAdmin();
    this.adminForm.reset();
    this.adminForm.patchValue({ actif: true, phone: 0 });
    this.adminDialog = true;
  }

  editAdmin(admin: Admin) {
    this.isNewAdmin = false;
    this.dialogHeader = 'Modifier Administrateur';
    this.admin = { ...admin };
    this.adminForm.patchValue({
      username: admin.username,
      email: admin.email,
      phone: admin.phone,
      departement: admin.departement,
      actif: admin.actif,
      password: '' // Don't show password
    });
    this.adminDialog = true;
  }

  viewAdmin(admin: Admin) {
    this.selectedAdmin = admin;
    this.viewDialog = true;
  }

  hideDialog() {
    this.adminDialog = false;
  }

  saveAdmin() {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formData = this.adminForm.value;

    const adminData: Admin = {
      ...this.admin,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      departement: formData.departement,
      actif: formData.actif,
      password: formData.password || undefined
    };

    if (this.isNewAdmin) {
      this.adminService.createAdmin(adminData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succes',
            detail: 'Administrateur cree avec succes',
            life: 3000
          });
          this.hideDialog();
          this.loadAdmins();
          this.saving = false;
        },
        error: (error) => {
          this.saving = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.error?.message || 'Erreur lors de la creation',
            life: 5000
          });
        }
      });
    } else {
      this.adminService.updateAdmin(adminData.idUser!, adminData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succes',
            detail: 'Administrateur mis a jour avec succes',
            life: 3000
          });
          this.hideDialog();
          this.loadAdmins();
          this.saving = false;
        },
        error: (error) => {
          this.saving = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.error?.message || 'Erreur lors de la mise a jour',
            life: 5000
          });
        }
      });
    }
  }

  deleteAdmin(admin: Admin) {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer cet administrateur ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.adminService.deleteAdmin(admin.idUser!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succes',
              detail: 'Administrateur supprime',
              life: 3000
            });
            this.loadAdmins();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer cet administrateur',
              life: 5000
            });
          }
        });
      }
    });
  }

  isCurrentUser(admin: Admin): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.username === admin.username;
  }

  exportData() {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Telechargement en cours...',
      life: 2000
    });
  }
}