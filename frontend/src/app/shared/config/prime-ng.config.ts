import { Injectable } from '@angular/core';

export interface PrimeNGTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    info: string;
    warning: string;
    danger: string;
    surface: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class PrimeNGConfigService {
  private currentTheme: string = 'vermeg-light';
  private themes: { [key: string]: PrimeNGTheme } = {};

  constructor() {
    this.initializeThemes();
  }

  private initializeThemes(): void {
    // Vermeg Corporate Theme - Light
    this.themes['vermeg-light'] = {
      name: 'Vermeg Light',
      colors: {
        primary: '#2c3e50',      // Vermeg blue
        secondary: '#64748b',    // Gray secondary
        success: '#10b981',      // Success green
        info: '#0ea5e9',        // Info blue
        warning: '#f59e0b',      // Warning orange
        danger: '#ef4444',       // Danger red
        surface: '#ffffff',        // White surface
        background: '#f8fafc',    // Light background
        text: '#1e293b',         // Dark text
        textSecondary: '#64748b', // Secondary text
        border: '#e2e8f0'        // Light border
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.06)'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        },
        fontWeight: {
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        }
      }
    };

    // Vermeg Corporate Theme - Dark
    this.themes['vermeg-dark'] = {
      name: 'Vermeg Dark',
      colors: {
        primary: '#3b82f6',      // Vermeg blue (lighter for dark mode)
        secondary: '#94a3b8',    // Gray secondary
        success: '#22c55e',      // Success green
        info: '#0ea5e9',        // Info blue
        warning: '#f59e0b',      // Warning orange
        danger: '#ef4444',       // Danger red
        surface: '#1e293b',        // Dark surface
        background: '#0f172a',    // Dark background
        text: '#f1f5f9',         // Light text
        textSecondary: '#cbd5e1', // Secondary text
        border: '#334155'        // Dark border
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        },
        fontWeight: {
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        }
      }
    };

    // Professional Blue Theme
    this.themes['professional-blue'] = {
      name: 'Professional Blue',
      colors: {
        primary: '#1e40af',      // Professional blue
        secondary: '#64748b',    // Gray secondary
        success: '#059669',      // Success green
        info: '#0891b2',        // Info blue
        warning: '#d97706',      // Warning yellow
        danger: '#dc2626',       // Danger red
        surface: '#ffffff',        // White surface
        background: '#f8fafc',    // Light background
        text: '#1e293b',         // Dark text
        textSecondary: '#64748b', // Secondary text
        border: '#e2e8f0'        // Light border
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(30, 64, 175, 0.05)',
        md: '0 4px 6px -1px rgba(30, 64, 175, 0.1), 0 2px 4px -1px rgba(30, 64, 175, 0.06)',
        lg: '0 10px 15px -3px rgba(30, 64, 175, 0.1), 0 4px 6px -4px rgba(30, 64, 175, 0.06)'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        },
        fontWeight: {
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        }
      }
    };
  }

  getTheme(name?: string): PrimeNGTheme {
    return this.themes[name || this.currentTheme];
  }

  setTheme(themeName: string): void {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      this.applyTheme(this.themes[themeName]);
      localStorage.setItem('prime-theme', themeName);
    }
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  getAvailableThemes(): string[] {
    return Object.keys(this.themes);
  }

  private applyTheme(theme: PrimeNGTheme): void {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', theme.colors.primary);
    root.style.setProperty('--secondary-color', theme.colors.secondary);
    root.style.setProperty('--success-color', theme.colors.success);
    root.style.setProperty('--info-color', theme.colors.info);
    root.style.setProperty('--warning-color', theme.colors.warning);
    root.style.setProperty('--danger-color', theme.colors.danger);
    root.style.setProperty('--surface-color', theme.colors.surface);
    root.style.setProperty('--background-color', theme.colors.background);
    root.style.setProperty('--text-color', theme.colors.text);
    root.style.setProperty('--text-secondary-color', theme.colors.textSecondary);
    root.style.setProperty('--border-color', theme.colors.border);
    
    // Apply typography
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    
    // Apply spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
    
    // Apply data attribute for CSS targeting
    root.setAttribute('data-theme', this.currentTheme);
  }

  initializeFromStorage(): void {
    const savedTheme = localStorage.getItem('prime-theme');
    if (savedTheme && this.themes[savedTheme]) {
      this.currentTheme = savedTheme;
      this.applyTheme(this.themes[savedTheme]);
    }
  }

  getCSSVariables(): string {
    const theme = this.themes[this.currentTheme];
    return `
      :root {
        --primary-color: ${theme.colors.primary};
        --secondary-color: ${theme.colors.secondary};
        --success-color: ${theme.colors.success};
        --info-color: ${theme.colors.info};
        --warning-color: ${theme.colors.warning};
        --danger-color: ${theme.colors.danger};
        --surface-color: ${theme.colors.surface};
        --background-color: ${theme.colors.background};
        --text-color: ${theme.colors.text};
        --text-secondary-color: ${theme.colors.textSecondary};
        --border-color: ${theme.colors.border};
        --font-family: ${theme.typography.fontFamily};
      }
      
      [data-theme="${this.currentTheme}"] {
        /* Theme-specific styles can be added here */
      }
    `;
  }
}
