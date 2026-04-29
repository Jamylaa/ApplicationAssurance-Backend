import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeMode, ThemeService } from '../../../core/theme.service';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { ButtonDirective } from 'primeng/button';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    standalone: true,
    imports: [ButtonDirective, NgClass, RouterLink]
})
export class NavbarComponent implements OnInit, OnDestroy {
  theme: ThemeMode = 'light';
  private themeSub?: Subscription;

  constructor(private readonly themeService: ThemeService) {}

  get isDark(): boolean {  return this.theme === 'dark';  }

  ngOnInit(): void {
    this.theme = this.themeService.currentTheme;
    this.themeSub = this.themeService.theme$.subscribe((theme) => (this.theme = theme)); }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
