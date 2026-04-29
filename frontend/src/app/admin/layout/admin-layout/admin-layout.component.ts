import { Component } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbPrimeComponent } from '../../../shared/components/breadcrumb/breadcrumb-prime.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.css'],
    standalone: true,
    imports: [SidebarComponent, NavbarComponent, BreadcrumbPrimeComponent, RouterOutlet, ToastModule, ConfirmDialogModule]
})
export class AdminLayoutComponent {
}
