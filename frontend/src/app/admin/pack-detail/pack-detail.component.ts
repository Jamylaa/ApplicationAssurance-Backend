import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pack, PackGarantie } from '../../models/entities.model';
import { PackService } from '../../core/services/pack.service';
import { NumberPipe } from '../../pipes/number.pipe';
import { ButtonDirective } from 'primeng/button';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { NgIf, NgClass, NgFor, DecimalPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-pack-detail',
    templateUrl: './pack-detail.component.html',
    styleUrls: ['./pack-detail.component.css'],
    standalone: true,
    imports: [NgIf, BreadcrumbComponent, NgClass, NgFor, ButtonDirective, DecimalPipe, DatePipe, NumberPipe],
  providers: [PackService]
})
export class PackDetailComponent implements OnInit {
  pack?: Pack;
  error = '';
  isLoading = true;
  breadcrumbItems: { label: string; link?: string }[] = [
    { label: 'Packs', link: '/admin/packs' },
    { label: 'Details' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private packService: PackService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Identifiant du pack manquant';
      this.isLoading = false;
      return;
    }

    this.packService.getPackById(id).subscribe({
      next: (pack: any) => {
        this.pack = pack;
        this.breadcrumbItems = this.buildBreadcrumbItems(pack);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Impossible de charger le pack.';
        this.isLoading = false;
      }
    });
  }

  getGaranties(type: 'incluses' | 'optionnelles'): PackGarantie[] {
    // garanties field removed from backend - return empty array
    // This should be updated to fetch from PackGarantie service
    return [];
  }

  getProduitName(): string {
    return this.pack?.produitId ?? 'Aucun';
  }

  getGarantieName(packGarantie: PackGarantie): string {
    return packGarantie.nomGarantie ?? packGarantie.garantieId ?? 'Garantie inconnue';
  }

  buildBreadcrumbItems(pack: Pack): { label: string; link?: string }[] {
    const items: { label: string; link?: string }[] = [];

    if (pack.produitId) {
      items.push({
        label: pack.nomPack,
        link: `/admin/produits/${pack.produitId}`
      });
    } else {
      items.push({
        label: 'Produit',
        link: '/admin/produits'
      });
    }

    items.push({
      label: pack.nomPack,
      link: pack.idPack ? `/admin/packs/${pack.idPack}` : '/admin/packs'
    });
    items.push({ label: 'Details' });

    return items;
  }

  back(): void {
    this.router.navigate(['/admin/packs']);
  }

  edit(): void {
    if (!this.pack?.idPack) return;
    this.router.navigate(['/admin/packs'], { queryParams: { editId: this.pack.idPack } });
  }
}
