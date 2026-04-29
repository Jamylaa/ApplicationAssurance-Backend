import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { GarantieService } from '../../core/services/garantie.service';
import { PackService } from '../../core/services/pack.service';
import { ProduitService } from '../../core/services/produit.service';

@Component({
  selector: 'app-offers-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './offers-dashboard.component.html',
  styleUrls: ['../offers.styles.css'],
  providers: [ProduitService, PackService, GarantieService]
})
export class OffersDashboardComponent implements OnInit {
  stats = {
    produits: 0,
    packs: 0,
    garanties: 0,
    prixMoyen: 0
  };

  simulationForm = this.fb.group({
    montant: [1000, [Validators.required, Validators.min(0)]],
    franchise: [50, [Validators.required, Validators.min(0)]],
    taux: [80, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  remboursement = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly produitService: ProduitService,
    private readonly packService: PackService,
    private readonly garantieService: GarantieService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.updateSimulation();
    this.simulationForm.valueChanges.subscribe(() => this.updateSimulation());
  }

  private loadStats(): void {
    forkJoin({
      produits: this.produitService.getAll().pipe(catchError(() => of([]))),
      packs: this.packService.getAll().pipe(catchError(() => of([]))),
      garanties: this.garantieService.getAll().pipe(catchError(() => of([])))
    }).subscribe(({ produits, packs, garanties }) => {
      const totalPrix = packs.reduce((sum, pack) => sum + Number(pack.prixMensuel ?? 0), 0);

      this.stats = {
        produits: produits.length,
        packs: packs.length,
        garanties: garanties.length,
        prixMoyen: packs.length ? totalPrix / packs.length : 0
      };
    });
  }

  private updateSimulation(): void {
    const montant = Number(this.simulationForm.value.montant ?? 0);
    const franchise = Number(this.simulationForm.value.franchise ?? 0);
    const taux = Number(this.simulationForm.value.taux ?? 0) / 100;
    const baseRemboursable = Math.max(montant - franchise, 0);

    this.remboursement = Number((baseRemboursable * taux).toFixed(2));
  }
}
