import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GarantieService } from '../../core/services/garantie.service';
import { PackConfigurationService } from '../../core/services/pack-configuration.service';
import { PackService } from '../../core/services/pack.service';
import { Garantie } from '../../models/entities.model';
import { PackGarantie } from '../../models/entities.model';
import { Pack } from '../../models/entities.model';

@Component({
  selector: 'app-pack-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pack-configuration.component.html',
  styleUrls: ['../offers.styles.css'],
  providers: [PackService, GarantieService]
})
export class PackConfigurationComponent implements OnInit {
  packs: Pack[] = [];
  catalogueGaranties: Garantie[] = [];
  garantiesPack: PackGarantie[] = [];
  selectedPackId = '';
  prixTotal = 0;
  feedback = '';

  configurationForm = this.fb.group({
    garantieId: ['', Validators.required],
    tauxRemboursement: [80, [Validators.required, Validators.min(0), Validators.max(100)]],
    plafond: [0, [Validators.required, Validators.min(0)]],
    franchise: [0, [Validators.required, Validators.min(0)]],
    estOptionnelle: [false],
    supplementPrix: [0, [Validators.required, Validators.min(0)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly packService: PackService,
    private readonly garantieService: GarantieService,
    private readonly packConfigurationService: PackConfigurationService
  ) {}

  ngOnInit(): void {
    this.loadCatalogue();
    this.route.queryParamMap.subscribe((params) => {
      this.selectedPackId = params.get('packId') ?? '';
      if (this.selectedPackId) {
        this.loadPackConfiguration(this.selectedPackId);
      }
    });
  }

  get garantiesIncluses(): PackGarantie[] {
    return this.garantiesPack.filter((garantie) => !garantie.optionnelle);
  }

  get garantiesOptionnelles(): PackGarantie[] {
    return this.garantiesPack.filter((garantie) => garantie.optionnelle);
  }

  loadCatalogue(): void {
    this.packService.getAll().subscribe({
      next: (packs: any) => (this.packs = packs),
      error: () => (this.feedback = 'Chargement des packs indisponible pour le moment.')
    });

    this.garantieService.getAll().subscribe({
      next: (garanties: any) => (this.catalogueGaranties = garanties),
      error: () => (this.feedback = 'Chargement des garanties indisponible pour le moment.')
    });
  }

  onPackChange(packId: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { packId: packId || null },
      queryParamsHandling: 'merge'
    });

    if (packId) {
      this.loadPackConfiguration(packId);
    } else {
      this.garantiesPack = [];
      this.prixTotal = 0;
    }
  }

  onGarantieSelected(): void {
    const garantie = this.catalogueGaranties.find(
      (item) => item.idGarantie === this.configurationForm.value.garantieId
    );

    if (!garantie) {
      return;
    }

    this.configurationForm.patchValue({
      tauxRemboursement: garantie.tauxRemboursement,
      plafond: garantie.plafondAnnuel,
      franchise: garantie.franchise
    });
  }

  ajouterGarantie(): void {
    if (!this.selectedPackId || this.configurationForm.invalid) {
      this.configurationForm.markAllAsTouched();
      return;
    }

    const raw = this.configurationForm.getRawValue();
    const garantieId = raw.garantieId ?? '';

    if (!garantieId) {
      return;
    }

    const payload: Partial<PackGarantie> = {
      packId: this.selectedPackId,
      garantieId,
      tauxRemboursement: Number(raw.tauxRemboursement ?? 0),
      plafond: Number(raw.plafond ?? 0),
      franchise: Number(raw.franchise ?? 0),
      optionnelle: Boolean(raw.estOptionnelle),
      supplementPrix: Number(raw.supplementPrix ?? 0)
    };

    this.packConfigurationService.ajouterGarantie(this.selectedPackId, garantieId, payload).subscribe({
      next: () => {
        this.feedback = 'Garantie ajoutee au pack avec succes.';
        this.resetForm();
        this.loadPackConfiguration(this.selectedPackId);
      },
      error: () => (this.feedback = 'Ajout de garantie echoue.')
    });
  }

  supprimerGarantie(packGarantie: PackGarantie): void {
    if (!this.selectedPackId || !packGarantie.idPackGarantie) {
      return;
    }

    if (!window.confirm(`Supprimer la garantie "${packGarantie.nomGarantie || packGarantie.garantieId}" ?`)) {
      return;
    }

    this.packConfigurationService.supprimer(this.selectedPackId, packGarantie.idPackGarantie).subscribe({
      next: () => {
        this.feedback = 'Garantie retiree du pack avec succes.';
        this.loadPackConfiguration(this.selectedPackId);
      },
      error: () => (this.feedback = 'Suppression de garantie echouee.')
    });
  }

  private loadPackConfiguration(packId: string): void {
    this.packConfigurationService.getGaranties(packId).subscribe({
      next: (garanties: any) => (this.garantiesPack = garanties),
      error: () => {
        this.garantiesPack = [];
        this.feedback = 'Impossible de charger les garanties du pack.';
      }
    });

    this.packConfigurationService.calculPrixTotal(packId).subscribe({
      next: (prixTotal: any) => (this.prixTotal = prixTotal),
      error: () => (this.prixTotal = 0)
    });
  }

  private resetForm(): void {
    this.configurationForm.reset({
      garantieId: '',
      tauxRemboursement: 80,
      plafond: 0,
      franchise: 0,
      estOptionnelle: false,
      supplementPrix: 0
    });
  }
}
