import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PrimeNGConfig } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule]
})
export class ThemeToggleComponent {
  isDarkMode = false;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.isDarkMode = localStorage.getItem('theme') === 'dark' || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    
    if (this.isDarkMode) {
      this.document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      this.document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  getThemeIcon(): string {
    return this.isDarkMode ? 'pi pi-moon' : 'pi pi-sun';
  }

  getThemeLabel(): string {
    return this.isDarkMode ? 'Mode Sombre' : 'Mode Clair';
  }
}
