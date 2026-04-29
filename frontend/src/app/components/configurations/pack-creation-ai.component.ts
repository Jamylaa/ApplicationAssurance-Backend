import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ChipsModule } from 'primeng/chips';
import { NgClass, NgIf } from '@angular/common';
import { AiFormSyncService } from './ai-form-sync.service';
import { PackService } from '../../core/services/pack.service';
import { Router } from '@angular/router';
import { NiveauCouverture } from '../../models/entities.model';

@Component({
  selector: 'app-pack-creation-ai',
  templateUrl: './pack-creation-ai.component.html',
  styleUrls: ['./pack-creation-ai.component.css'],
  standalone: true,
  imports: [
    NgClass, NgIf, FormsModule, ReactiveFormsModule, 
    InputTextModule, InputTextareaModule, InputNumberModule,
    ButtonDirective, MessageModule, DropdownModule, ChipsModule
  ],
  providers: [AiFormSyncService, PackService]
})
export class PackCreationAiComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // UI State
  loading: boolean = false;
  aiMode: boolean = false;
  showForm: boolean = false;
  
  // Form
  packForm!: FormGroup;
  
  // AI Prompt
  aiPrompt: string = '';
  
  // Data
  niveauCouvertureOptions = [
    { label: 'Basique', value: NiveauCouverture.BASIC },
    { label: 'Premium', value: NiveauCouverture.PREMIUM },
    { label: 'Gold', value: NiveauCouverture.GOLD }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private aiFormSync: AiFormSyncService,
    private packService: PackService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.setupAiSync();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.packForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      prix: [0, [Validators.required, Validators.min(0)]],
      produitsAssocies: [[], Validators.required],
      garantiesIncluses: [[]],
      niveauCouverture: [NiveauCouverture.PREMIUM, Validators.required],
      statut: ['ACTIF', Validators.required]
    });
  }

  private setupAiSync(): void {
    this.aiFormSync.syncData.pipe(
      takeUntil(this.destroy$)
    ).subscribe(syncData => {
      if (syncData?.type === 'pack' && syncData?.status === 'completed') {
        this.handleAiSyncSuccess(syncData.data);
      } else if (syncData?.type === 'pack' && syncData?.status === 'error') {
        this.handleAiSyncError();
      }
    });

    this.aiFormSync.isSyncing.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isLoading => {
      this.loading = isLoading;
    });
  }

  private handleAiSyncSuccess(data: any): void {
    const formData = this.aiFormSync.transformPackToFormData(data);
    this.packForm.patchValue(formData);
    this.showForm = true;
    this.aiMode = false;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Le pack a été généré par l\'IA avec succès'
    });
  }

  private handleAiSyncError(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de générer le pack à partir de votre description'
    });
  }

  toggleAiMode(): void {
    this.aiMode = !this.aiMode;
    if (this.aiMode) {
      this.showForm = false;
      this.aiPrompt = '';
    }
  }

  generateFromAi(): void {
    if (!this.aiPrompt || this.aiPrompt.trim().length < 10) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez fournir une description plus détaillée (minimum 10 caractères)'
      });
      return;
    }

    this.aiFormSync.syncPackFromPrompt(this.aiPrompt);
  }

  savePack(): void {
    if (this.packForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de validation',
        detail: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    this.loading = true;
    const packData = this.packForm.value;

    this.packService.createPack(packData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Le pack a été créé avec succès'
        });
        this.router.navigate(['/packs']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de créer le pack: ' + (error.message || 'Erreur inconnue')
        });
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.packForm.reset({
      nom: '',
      description: '',
      prix: 0,
      produitsAssocies: [],
      garantiesIncluses: [],
      niveauCouverture: NiveauCouverture.PREMIUM,
      statut: 'ACTIF'
    });
    this.aiPrompt = '';
    this.showForm = false;
    this.aiMode = false;
    this.aiFormSync.clearSyncData();
  }

  cancel(): void {
    this.router.navigate(['/packs']);
  }

  get formInvalid(): boolean {
    return this.packForm.invalid;
  }

  get aiPromptInvalid(): boolean {
    return !this.aiPrompt || this.aiPrompt.trim().length < 10;
  }

  get helpText(): string {
    if (this.aiMode) {
      return 'Décrivez en détail le pack d\'assurance que vous souhaitez créer. L\'IA générera automatiquement toutes les informations nécessaires.';
    }
    return 'Remplissez le formulaire ci-dessous pour créer un nouveau pack d\'assurance.';
  }
}
