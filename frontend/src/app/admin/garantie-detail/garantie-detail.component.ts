import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Garantie } from '../../models/entities.model';
import { GarantieService } from '../../core/services/garantie.service';
import { NumberPipe } from '../../pipes/number.pipe';
import { ButtonDirective } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-garantie-detail',
    templateUrl: './garantie-detail.component.html',
    styleUrls: ['./garantie-detail.component.css'],
    standalone: true,
    imports: [NgIf, BreadcrumbComponent, TagModule, NgFor, ButtonDirective, DecimalPipe, DatePipe, NumberPipe],
  providers: [GarantieService]
})
export class GarantieDetailComponent implements OnInit {
  garantie?: any;
  error = '';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private garantieService: GarantieService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Identifiant de la garantie manquant';
      this.isLoading = false;
      return;
    }

    this.garantieService.getGarantieById(id).subscribe({
      next: (garantie: any) => {
        this.garantie = garantie;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Impossible de charger la garantie.';
        this.isLoading = false;
      }
    });
  }

  back(): void {
    this.router.navigate(['/admin/garanties']);
  }

  edit(): void {
    if (!this.garantie?.idGarantie) return;
    this.router.navigate(['/admin/garanties'], { queryParams: { editId: this.garantie.idGarantie } });
  }
}
