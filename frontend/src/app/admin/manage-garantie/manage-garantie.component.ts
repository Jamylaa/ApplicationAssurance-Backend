import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import {
  BASE_CALCUL_VALUES,
  Garantie,
  Statut,
  TypeMontant,
  TypePlafond,
  TypeGarantie,
  NiveauCouverture,
  CouvertureGeographique,
  TypeClient
} from '../../models/entities.model';
import { GarantieService } from '../../core/services/garantie.service';
import { GarantieChatbotService, GarantieChatbotResponse } from '../../core/services/garantie-chatbot.service';
import { NumberPipe } from '../../pipes/number.pipe';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { MessageModule } from 'primeng/message';
import { StepsModule } from 'primeng/steps';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Ripple } from 'primeng/ripple';
import { ButtonDirective } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
    selector: 'app-manage-garantie',
    templateUrl: './manage-garantie.component.html',
    styleUrls: ['./manage-garantie.component.css'],
    standalone: true,
    imports: [ToolbarModule, PrimeTemplate, ButtonDirective, Ripple, TableModule, InputTextModule, RouterLink, TagModule, DialogModule, StepsModule, MessageModule, FormsModule, ReactiveFormsModule, TabViewModule, NgIf, DropdownModule, InputTextareaModule, NgFor, InputNumberModule, InputSwitchModule, DecimalPipe, NumberPipe],
  providers: [GarantieService]
})
export class ManageGarantieComponent implements OnInit {
  garanties: Garantie[] = [];
  loading = true;
  garantieForm: FormGroup;
  isEditing = false;
  currentId: string | null = null;
  showForm = false;
  showChatbot = false;
  isCreatingWithChatbot = false;
  activeIndex = 0;
  readonly steps = [
    { label: 'Général' },
    { label: 'Couvertures' },
    { label: 'Plafonds' },
    { label: 'Eligibilité' },
    { label: 'Exclusions' }
  ];
  breadcrumbItems = [{ label: 'Garanties', link: '/admin/garanties' }];
  private pendingEditId: string | null = null;

  readonly statuts = Object.values(Statut);
  readonly typesGarantie = Object.values(TypeGarantie);
  readonly niveauxCouverture = Object.values(NiveauCouverture);
  readonly typesMontant = Object.values(TypeMontant);
  readonly typesPlafond = Object.values(TypePlafond);
  readonly couverturesGeo = Object.values(CouvertureGeographique);
  readonly typesClient = Object.values(TypeClient);
  readonly basesCalcul = [...BASE_CALCUL_VALUES];

  constructor(
    private garantieService: GarantieService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private garantieChatbotService: GarantieChatbotService
  ) {
    this.garantieForm = this.fb.group({
      // codeGarantie: ['', Validators.required],
      nomGarantie: ['', Validators.required],
      description: ['', Validators.required],
      typeGarantie: [TypeGarantie.HOSPITALISATION, Validators.required],
      statut: [Statut.ACTIF, Validators.required],
      
      // Champs backend nouveaux
      tauxRemboursement: [80, [Validators.required, Validators.min(0), Validators.max(100)]],
      typeMontant: [TypeMontant.FRAIS_REELS, Validators.required],
      typePlafond: [TypePlafond.ANNUEL, Validators.required],
      plafondAnnuel: [0, [Validators.required, Validators.min(0)]],
      plafondMensuel: [0, [Validators.min(0)]],
      plafondParActe: [0, [Validators.min(0)]],
      franchise: [0, [Validators.min(0)]],
      coutMoyenParSinistre: [0, [Validators.min(0)]],
      dureeMinContrat: [12, [Validators.required, Validators.min(1)]],
      dureeMaxContrat: [60, [Validators.required, Validators.min(1)]],
      resiliableAnnuellement: [true],
      creePar: [''],
      dateDesactivation: [null],
      
      couvertures: this.fb.array([]),
      plafondsLimites: this.fb.array([]),
      conditionsEligibilite: this.fb.group({
        ageMinimum: [null],
        ageMaximum: [null],
        typeClient: ['INDIVIDUEL'],
        conditionsMedicales: [''],
        ancienneteContratMois: [0],
        exclusionMaladiesChroniques: [false]
      }),
      regleCalcul: this.fb.group({
        formuleRemboursement: [''],
        baseCalcul: ['FRAIS_REELS'],
        cumulAutresGarantiesAutorise: [true],
        prioriteGarantie: [1],
        descriptionRegle: ['']
      }),
      exclusions: this.fb.group({
        maladiesExcluesText: [''],
        actesNonRemboursablesText: [''],
        depassementsNonPrisEnChargeText: [''],
        soinsEtrangerExclus: [false],
        autresExclusionsText: ['']
      }),
      // parametresTechniques: this.fb.group({
      //   mappingChampsFormulaireText: [''],
      //   codeInterne: [''],
      //   workflowAssocie: [''],
      //   reglesControleText: [''],
      //   actif: [true]
      // })
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.pendingEditId = params.get('editId');
      this.tryOpenPendingEdit();
    });
    this.loadGaranties();
    this.addCouverture();
    this.addPlafond();
  }

  get couverturesArray(): FormArray<FormGroup> { return this.garantieForm.get('couvertures') as FormArray<FormGroup>; }

  get plafondsArray(): FormArray<FormGroup> { return this.garantieForm.get('plafondsLimites') as FormArray<FormGroup>; }

  createCouvertureGroup(value?: any): FormGroup {
    return this.fb.group({
      typeSoins: [value?.typeSoins ?? 'HOSPITALISATION', Validators.required],
      actesMedicauxInclusText: [(value?.actesMedicauxInclus ?? []).join(', ')],
      niveauCouverture: [value?.niveauCouverture ?? NiveauCouverture.PREMIUM, Validators.required],
      tauxRemboursement: [value?.tauxRemboursement ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      typeMontant: [value?.typeMontant ?? 'FORFAIT', Validators.required],
      montantRembourse: [value?.montantRembourse ?? 0, [Validators.required, Validators.min(0)]]
    });
  }

  createPlafondGroup(value?: any): FormGroup {
    return this.fb.group({
      typePlafond: [value?.typePlafond ?? 'ANNUEL', Validators.required],
      montantPlafond: [value?.montantPlafond ?? 0, [Validators.required, Validators.min(0)]],
      nombreMaxRemboursements: [value?.nombreMaxRemboursements ?? 0, [Validators.min(0)]],
      franchise: [value?.franchise ?? 0, [Validators.min(0)]],
      delaiCarenceMois: [value?.delaiCarenceMois ?? 0, [Validators.min(0)]],
      couvertureGeographique: [value?.couvertureGeographique ?? 'NATIONAL', Validators.required]
    });
  }

  addCouverture(value?: any): void {
    this.couverturesArray.push(this.createCouvertureGroup(value));
  }

  removeCouverture(index: number): void {
    if (this.couverturesArray.length === 1) {
      this.couverturesArray.at(0).reset({
        typeSoins: 'HOSPITALISATION',
        actesMedicauxInclusText: '',
        niveauCouverture: NiveauCouverture.PREMIUM,
        tauxRemboursement: 0,
        typeMontant: 'FORFAIT',
        montantRembourse: 0
      });
      return;
    }

    this.couverturesArray.removeAt(index);
  }

  addPlafond(value?: any): void {
    this.plafondsArray.push(this.createPlafondGroup(value));
  }

  removePlafond(index: number): void {
    if (this.plafondsArray.length === 1) {
      this.plafondsArray.at(0).reset({
        typePlafond: 'ANNUEL',
        montantPlafond: 0,
        nombreMaxRemboursements: 0,
        franchise: 0,
        delaiCarenceMois: 0,
        couvertureGeographique: 'NATIONAL'
      });
      return;
    }

    this.plafondsArray.removeAt(index);
  }

  resetNestedArrays(garantie?: Garantie): void {
    while (this.couverturesArray.length) {
      this.couverturesArray.removeAt(0);
    }
    while (this.plafondsArray.length) {
      this.plafondsArray.removeAt(0);
    }

    // Removed references to deleted backend fields:
    // - couvertures
    // - plafondsLimites
    // These should be handled by separate services if needed
    this.addCouverture();
    this.addPlafond();
  }

  loadGaranties(): void {
    this.loading = true;
    this.garantieService.getAllGaranties().subscribe({
      next: (res: any) => {
        this.garanties = res;
        this.loading = false;
        this.tryOpenPendingEdit();
      },
      error: (err: any) => {
        console.error('Error loading garanties', err);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les garanties' });
      }
    });
  }

  parseList(value: string | null | undefined): string[] {
    return String(value ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  parseMap(value: string | null | undefined): Record<string, string> {
    return String(value ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .reduce<Record<string, string>>((accumulator, line) => {
        const [key, ...rest] = line.split(':');
        if (!key) {
          return accumulator;
        }

        accumulator[key.trim()] = rest.join(':').trim();
        return accumulator;
      }, {});
  }

  mapToText(value: Record<string, string> | undefined): string {
    return Object.entries(value ?? {})
      .map(([key, entry]) => `${key}: ${entry}`)
      .join('\n');
  }

  onSubmit(): void {
    if (this.garantieForm.invalid) {
      this.garantieForm.markAllAsTouched();
      return;
    }

    const rawValue = this.garantieForm.getRawValue();
    const payload: any = {
      idGarantie: this.currentId ?? undefined,
      // codeGarantie: rawValue.codeGarantie,
      nomGarantie: rawValue.nomGarantie,
      description: rawValue.description,
      typeGarantie: rawValue.typeGarantie,
      statut: rawValue.statut,
      
      // Champs backend nouveaux
      tauxRemboursement: Number(rawValue.tauxRemboursement),
      typeMontant: rawValue.typeMontant,
      typePlafond: rawValue.typePlafond,
      plafondAnnuel: Number(rawValue.plafondAnnuel),
      plafondMensuel: Number(rawValue.plafondMensuel),
      plafondParActe: Number(rawValue.plafondParActe),
      franchise: Number(rawValue.franchise),
      coutMoyenParSinistre: Number(rawValue.coutMoyenParSinistre),
      dureeMinContrat: Number(rawValue.dureeMinContrat),
      dureeMaxContrat: Number(rawValue.dureeMaxContrat),
      resiliableAnnuellement: Boolean(rawValue.resiliableAnnuellement),
      creePar: rawValue.creePar || 'admin',
      dateDesactivation: rawValue.dateDesactivation,
      
      couvertures: (rawValue.couvertures ?? []).map((couverture: any) => ({
        typeSoins: couverture.typeSoins,
        actesMedicauxInclus: this.parseList(couverture.actesMedicauxInclusText),
        niveauCouverture: couverture.niveauCouverture,
        tauxRemboursement: Number(couverture.tauxRemboursement ?? 0),
        typeMontant: couverture.typeMontant,
        montantRembourse: Number(couverture.montantRembourse ?? 0)
      })),
      plafondsLimites: (rawValue.plafondsLimites ?? []).map((plafond: any) => ({
        typePlafond: plafond.typePlafond,
        montantPlafond: Number(plafond.montantPlafond ?? 0),
        nombreMaxRemboursements: Number(plafond.nombreMaxRemboursements ?? 0),
        franchise: Number(plafond.franchise ?? 0),
        delaiCarenceMois: Number(plafond.delaiCarenceMois ?? 0),
        couvertureGeographique: plafond.couvertureGeographique
      })),
      conditionsEligibilite: {
        ageMinimum: rawValue.conditionsEligibilite.ageMinimum !== null ? Number(rawValue.conditionsEligibilite.ageMinimum) : undefined,
        ageMaximum: rawValue.conditionsEligibilite.ageMaximum !== null ? Number(rawValue.conditionsEligibilite.ageMaximum) : undefined,
        typeClient: rawValue.conditionsEligibilite.typeClient,
        conditionsMedicales: rawValue.conditionsEligibilite.conditionsMedicales,
        ancienneteContratMois: Number(rawValue.conditionsEligibilite.ancienneteContratMois ?? 0),
        exclusionMaladiesChroniques: Boolean(rawValue.conditionsEligibilite.exclusionMaladiesChroniques)
      },
      regleCalcul: {
        formuleRemboursement: rawValue.regleCalcul.formuleRemboursement,
        baseCalcul: rawValue.regleCalcul.baseCalcul,
        cumulAutresGarantiesAutorise: Boolean(rawValue.regleCalcul.cumulAutresGarantiesAutorise),
        prioriteGarantie: Number(rawValue.regleCalcul.prioriteGarantie ?? 0),
        descriptionRegle: rawValue.regleCalcul.descriptionRegle
      },
      exclusions: {
        maladiesExclues: this.parseList(rawValue.exclusions.maladiesExcluesText),
        actesNonRemboursables: this.parseList(rawValue.exclusions.actesNonRemboursablesText),
        depassementsNonPrisEnCharge: this.parseList(rawValue.exclusions.depassementsNonPrisEnChargeText),
        soinsEtrangerExclus: Boolean(rawValue.exclusions.soinsEtrangerExclus),
        autresExclusions: this.parseList(rawValue.exclusions.autresExclusionsText)
      },
      // parametresTechniques: {
      //   mappingChampsFormulaire: this.parseMap(rawValue.parametresTechniques.mappingChampsFormulaireText),
      //   codeInterne: rawValue.parametresTechniques.codeInterne,
      //   workflowAssocie: rawValue.parametresTechniques.workflowAssocie,
      //   reglesControle: this.parseMap(rawValue.parametresTechniques.reglesControleText),
      //   actif: Boolean(rawValue.parametresTechniques.actif)
      // },
      
      tauxCouverture: Number(rawValue.tauxRemboursement),
      actif: rawValue.statut === Statut.ACTIF,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    };

    const request$ = this.isEditing && this.currentId
      ? this.garantieService.updateGarantie(this.currentId, payload)
      : this.garantieService.createGarantie(payload);

    request$.subscribe({
      next: () => {
        this.loadGaranties();
        this.resetForm();
        this.showForm = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: this.isEditing ? 'Garantie mise a jour' : 'Garantie creee'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: this.isEditing ? 'Mise a jour echouee' : 'Creation echouee'
        });
      }
    });
  }

  modifier(garantie: Garantie): void {
    this.isEditing = true;
    this.currentId = garantie.idGarantie ?? null;
    this.activeIndex = 0;
    this.garantieForm.patchValue({
      // codeGarantie: garantie.codeGarantie ?? '',
      nomGarantie: garantie.nomGarantie,
      description: garantie.description,
      typeGarantie: garantie.typeGarantie ?? TypeGarantie.HOSPITALISATION,
      statut: garantie.statut ?? 'ACTIF',
      // Deleted fields removed from backend:
      // - conditionsEligibilite
      // - regleCalcul  
      // - exclusions
      // These should be handled by separate services if needed
      // parametresTechniques: {
      //   mappingChampsFormulaireText: this.mapToText(garantie.parametresTechniques?.mappingChampsFormulaire),
      //   codeInterne: garantie.parametresTechniques?.codeInterne ?? '',
      //   workflowAssocie: garantie.parametresTechniques?.workflowAssocie ?? '',
      //   reglesControleText: this.mapToText(garantie.parametresTechniques?.reglesControle),
      //   actif: garantie.parametresTechniques?.actif ?? true
      // }
    });
    this.resetNestedArrays(garantie);
    this.showForm = true; }

  private tryOpenPendingEdit(): void {
    if (!this.pendingEditId || !this.garanties.length) {
      return;  }

    const targetGarantie = this.garanties.find((garantie) => garantie.idGarantie === this.pendingEditId);
    if (!targetGarantie) {
      return;
    }

    this.modifier(targetGarantie);
    this.pendingEditId = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { editId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  voirDetails(garantie: Garantie): void {
    if (!garantie.idGarantie) {
      return;
    }

    this.router.navigate(['/admin/garanties', garantie.idGarantie]);
  }

  supprimer(idGarantie: string): void {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer cette garantie ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.garantieService.deleteGarantie(idGarantie).subscribe({
          next: () => {
            this.loadGaranties();
            this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Garantie supprimee' });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression echouee' })
        });
      }
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentId = null;
    this.activeIndex = 0;
    this.garantieForm.reset({
      // codeGarantie: '',
      typeGarantie: TypeGarantie.HOSPITALISATION,
      statut: Statut.ACTIF,
      description: '',
      
      // Champs backend nouveaux
      tauxRemboursement: 80,
      typeMontant: TypeMontant.FRAIS_REELS,
      typePlafond: TypePlafond.ANNUEL,
      plafondAnnuel: 0,
      plafondMensuel: 0,
      plafondParActe: 0,
      franchise: 0,
      coutMoyenParSinistre: 0,
      dureeMinContrat: 12,
      dureeMaxContrat: 60,
      resiliableAnnuellement: true,
      creePar: '',
      dateDesactivation: null,
      
      conditionsEligibilite: {
        ageMinimum: null,
        ageMaximum: null,
        typeClient: 'INDIVIDUEL',
        conditionsMedicales: '',
        ancienneteContratMois: 0,
        exclusionMaladiesChroniques: false
      },
      regleCalcul: {
        formuleRemboursement: '',
        baseCalcul: 'FRAIS_REELS',
        cumulAutresGarantiesAutorise: true,
        prioriteGarantie: 1,
        descriptionRegle: ''
      },
      exclusions: {
        maladiesExcluesText: '',
        actesNonRemboursablesText: '',
        depassementsNonPrisEnChargeText: '',
        soinsEtrangerExclus: false,
        autresExclusionsText: ''
      }
      // parametresTechniques: {
      //   mappingChampsFormulaireText: '',
      //   codeInterne: '',
      //   workflowAssocie: '',
      //   reglesControleText: '',
      //   actif: true
      // }
    });
    this.resetNestedArrays();
  }

  // Chatbot methods
  openChatbot(): void {
    this.showChatbot = true;
    this.isCreatingWithChatbot = true;
  }

  closeChatbot(): void {
    this.showChatbot = false;
    this.isCreatingWithChatbot = false;
  }

  onGarantieCreatedByChatbot(response: GarantieChatbotResponse): void {
    const garantieCreee = response.garanties?.[0] as { nomGarantie?: string } | undefined;

    if (garantieCreee) {
      this.messageService.add({
        severity: 'success',
        summary: 'Garantie créée avec succès',
        detail: `La garantie "${response.garantie.nomGarantie}" a été créée par l'assistant IA`
      });
      
      // Recharger la liste des garanties
      this.loadGaranties();
      
      // Fermer le chatbot après un délai
      setTimeout(() => {
        this.closeChatbot();
      }, 2000);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Impossible de créer la garantie avec l\'assistant IA'
      });
    }
  }
}
