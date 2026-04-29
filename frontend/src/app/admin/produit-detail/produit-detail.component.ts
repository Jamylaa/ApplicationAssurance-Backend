import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Pack, PackGarantie, Produit, TypeProduit } from '../../models/entities.model';
import { ProduitService } from '../../core/services/produit.service';
import { NumberPipe } from '../../pipes/number.pipe';
import { ButtonDirective } from 'primeng/button';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { NgIf, NgClass, NgFor, SlicePipe, DecimalPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-produit-detail',
    templateUrl: './produit-detail.component.html',
    styleUrls: ['./produit-detail.component.css'],
    standalone: true,
    imports: [NgIf, BreadcrumbComponent, NgClass, NgFor, RouterLink, ButtonDirective, SlicePipe, DecimalPipe, DatePipe, NumberPipe],
  providers: [ProduitService]
})
export class ProduitDetailComponent implements OnInit {
  produit?: Produit;
  err = '';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.err = 'Identifiant du produit manquant';
      this.isLoading = false;
      return;
    }

    this.produitService.getProduitById(id).subscribe({
      next: (produit: any) => {
        this.produit = produit;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.err = 'Impossible de charger le produit.';
        this.isLoading = false;
      }
    });
  }

  getPacks(): Pack[] {
    // packs field removed from backend - return empty array
    // This should be updated to fetch from Pack service
    return [];
  }

  getSortedPacks(): Pack[] {
    const priority = ['BASIC', 'PREMIUM', 'GOLD'];

    return [...this.getPacks()].sort((left, right) => {
      const leftPriority = priority.indexOf(left.niveauCouverture ?? 'BASIC');
      const rightPriority = priority.indexOf(right.niveauCouverture ?? 'BASIC');
      return leftPriority - rightPriority;
    });
  }

  getPackCategory(pack: Pack): 'BASIC' | 'PREMIUM' | 'GOLD' | 'other' {
    const niveau = pack.niveauCouverture;
    if (niveau === 'BASIC') return 'BASIC';
    if (niveau === 'PREMIUM') return 'PREMIUM';
    if (niveau === 'GOLD') return 'GOLD';
    return 'other';
  }

  getPackAccentClass(pack: Pack): string {
    switch (this.getPackCategory(pack)) {
      case 'BASIC':
        return 'pack-card pack-card--basic';
      case 'PREMIUM':
        return 'pack-card pack-card--premium';
      case 'GOLD':
        return 'pack-card pack-card--gold';
      default:
        return 'pack-card pack-card--default';
    }
  }

  getPackGaranties(pack: Pack): PackGarantie[] {
    // garanties field removed from backend - return empty array
    // This should be updated to fetch from PackGarantie service
    return [];
  }

  getComparisonRows(): string[] {
    const labels = this.getSortedPacks()
      .flatMap((pack) => this.getPackGaranties(pack).map((garantie) => garantie.nomGarantie ?? garantie.garantieId))
      .filter((label): label is string => Boolean(label));

    return Array.from(new Set(labels));
  }

  getPackGarantieByLabel(pack: Pack, label: string): PackGarantie | undefined {
    return this.getPackGaranties(pack).find(
      (garantie) => (garantie.nomGarantie ?? garantie.garantieId) === label
    );
  }

  getGarantieCell(pack: Pack, label: string): string {
    const garantie = this.getPackGarantieByLabel(pack, label);
    if (!garantie) {
      return '-';
    }

    const pieces = [
      `${garantie.tauxRemboursement}%`,
      `${garantie.plafond} DT`
    ];

    if (garantie.optionnelle) {
      pieces.push(`Option +${garantie.supplementPrix} DT`);
    }

    return pieces.join(' | ');
  }

  getPackSubtitle(pack: Pack): string {
    const category = this.getPackCategory(pack);
    if (category === 'other') {
      return pack.niveauCouverture;
    }

    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  getTypeLabel(): string {
    switch (this.produit?.typeProduit) {
      case TypeProduit.AUTO:
        return 'Auto';
      case TypeProduit.HABITATION:
        return 'Habitation';
      case TypeProduit.VIE:
        return 'Vie';
      case TypeProduit.SANTE:
      default:
        return 'Sante';
    }
  }

  back(): void {
    this.router.navigate(['/admin/produits']);
  }

  edit(): void {
    if (!this.produit?.idProduit) return;
    this.router.navigate(['/admin/produits'], { queryParams: { editId: this.produit.idProduit } });
  }
}
