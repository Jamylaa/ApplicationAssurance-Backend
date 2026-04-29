import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: true,
    imports: [PanelMenuModule]
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      expanded: true,
      items: [
        {
          label: 'Tableau de bord',
          icon: 'pi pi-chart-bar',
          routerLink: ['/admin/offres/dashboard']
        }
      ]
    },
    {
      label: 'Utilisateurs',
      icon: 'pi pi-users',
      expanded: true,
      items: [
        {
          label: 'Administrateurs',
          icon: 'pi pi-user-edit',
          routerLink: ['/admin/admins']
        },
        {
          label: 'Clients',
          icon: 'pi pi-users',
          routerLink: ['/admin/clients']
        }
      ]
    },
    {
      label: 'Gestion des Offres ',
      icon: 'pi pi-sitemap',
      expanded: true,
      items: [
        {
          label: 'Produits ',
          icon: 'pi pi-briefcase',
          routerLink: ['/admin/produits']
        },
        {
          label: 'Packs ',
          icon: 'pi pi-inbox',
          routerLink: ['/admin/packs']
        },
        {
          label: 'Garanties ',
          icon: 'pi pi-shield',
          routerLink: ['/admin/garanties']
        },
        {
          label: 'Config Packs',
          icon: 'pi pi-cog',
          routerLink: ['/admin/offres/configuration']
        }
      ]
    },
    {
      label: 'Souscriptions',
      icon: 'pi pi-file-check',
      expanded: true,
      items: [
        {
          label: 'Gestion des souscriptions',
          icon: 'pi pi-check-square',
          routerLink: ['/admin/subscriptions']
        }
      ]
    },
    {
      label: 'Assistance IA',
      icon: 'pi pi-sparkles',
      expanded: true,
      items: [
        {
          label: 'Recommendation',
          icon: 'pi pi-comments',
          routerLink: ['/admin/recommendation-chat']
        }
      ]
    }
  ];
}
