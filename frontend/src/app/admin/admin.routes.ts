import { Routes } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminChatComponent } from './admin-chat/admin-chat.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GarantieDetailComponent } from './garantie-detail/garantie-detail.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { ManageGarantieComponent } from './manage-garantie/manage-garantie.component';
import { ManagePackComponent } from './manage-pack/manage-pack.component';
import { ManageProduitComponent } from './manage-produit/manage-produit.component';
import { PackDetailComponent } from './pack-detail/pack-detail.component';
import { ProduitDetailComponent } from './produit-detail/produit-detail.component';
import { ProfileComponent } from './profile/profile.component';
import { RecommendationChatComponent } from './recommendation-chat/recommendation-chat.component';
import { SettingsComponent } from './settings/settings.component';
import { UnifiedChatbotComponent } from './unified-chatbot/unified-chatbot.component';
import { ManageAdminComponent } from './manage-admin/manage-admin.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    providers: [MessageService, ConfirmationService],
    children: [
      { path: 'dashboard', component: DashboardComponent, data: { breadcrumb: 'Tableau de bord' } },
      { path: 'admins', component: ManageAdminComponent, data: { breadcrumb: 'Administrateurs' } },
      {
        path: 'produits',
        children: [
          { path: '', component: ManageProduitComponent, data: { breadcrumb: 'Produits' } },
          { path: ':id', component: ProduitDetailComponent, data: { breadcrumb: 'Details Produit' } }
        ]
      },
      {
        path: 'packs',
        children: [
          { path: '', component: ManagePackComponent, data: { breadcrumb: 'Packs' } },
          { path: ':id', component: PackDetailComponent, data: { breadcrumb: 'Details Pack' } }
        ]
      },
      {
        path: 'garanties',
        children: [
          { path: '', component: ManageGarantieComponent, data: { breadcrumb: 'Garanties' } },
          { path: ':id', component: GarantieDetailComponent, data: { breadcrumb: 'Details Garantie' } }
        ]
      },
      {
        path: 'offres',
        loadChildren: () => import('../features/offers.routes').then((m) => m.OFFERS_ROUTES)
      },
      { path: 'chat', component: AdminChatComponent, data: { breadcrumb: 'Chat Creation' } },
      { path: 'recommendation-chat', component: RecommendationChatComponent, data: { breadcrumb: 'Chat Recommandation' } },
      { path: 'unified-chat', component: UnifiedChatbotComponent, data: { breadcrumb: 'Assistant Unifie' } },
      { path: 'profile', component: ProfileComponent, data: { breadcrumb: 'Profil' } },
      { path: 'settings', component: SettingsComponent, data: { breadcrumb: 'Parametres' } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
