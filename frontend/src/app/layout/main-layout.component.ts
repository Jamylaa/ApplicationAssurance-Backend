import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../shared/components/sidebar.component';
import { BreadcrumbComponent } from '../shared/components/breadcrumb.component';
import { BreadcrumbService } from '../shared/services/breadcrumb.service';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  standalone: true,
  imports: [RouterOutlet, BreadcrumbComponent, SidebarComponent, CommonModule, FormsModule],
  providers: []
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  showUserDropdown = false;
  searchOpen = false;
  searchQuery = '';

  private resizeHandler = () => this.checkMobileView();

  constructor(
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private themeService: ThemeService
  ) {
    this.loadUserData();
  }

  ngOnInit(): void {
    this.breadcrumbService.updateBreadcrumbFromUrl();
    this.checkMobileView();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }

  loadUserData(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((s) => s[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getCurrentPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/users')) return 'Utilisateurs';
    if (url.includes('/produits')) return 'Produits';
    if (url.includes('/packs')) return 'Packs';
    if (url.includes('/garanties')) return 'Garanties';
    return 'Dashboard';
  }

  getCurrentPageIcon(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'bi-grid-1x2-fill';
    if (url.includes('/users')) return 'bi-people-fill';
    if (url.includes('/produits')) return 'bi-box-seam-fill';
    if (url.includes('/packs')) return 'bi-collection-fill';
    if (url.includes('/garanties')) return 'bi-shield-fill-check';
    return 'bi-grid-1x2-fill';
  }

  onSidebarToggle(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileSidebar(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileMenuOpen = false;
  }

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
  }

  closeSearch(): void {
    setTimeout(() => {
      this.searchOpen = false;
      this.searchQuery = '';
    }, 150);
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  closeDropdown(): void {
    this.showUserDropdown = false;
  }

  checkMobileView(): void {
    if (window.innerWidth < 768) {
      this.isSidebarCollapsed = true;
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}
