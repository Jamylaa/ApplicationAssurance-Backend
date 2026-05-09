import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { ChatbotService, ChatbotResponse, ChatbotIntent } from '../../services/chatbot.service';
import { ToastService } from '../../shared/services/toast.service';
import { BreadcrumbService } from '../../shared/services/breadcrumb.service';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  intent?: ChatbotIntent;
  actions?: Array<{
    type: 'CREATE' | 'UPDATE' | 'DELETE' | 'NAVIGATE' | 'LIST';
    label: string;
    data?: unknown;
    route?: string[];
  }>;
}

@Component({
  selector: 'app-unified-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ButtonModule,
    InputTextareaModule,
    ProgressSpinnerModule,
    CardModule,
    BadgeModule,
    TagModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './unified-chatbot.component.html',
  styleUrls: ['./unified-chatbot.component.css']
})
export class UnifiedChatbotComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  currentMessage = '';
  isLoading = false;

  // Configuration du chatbot
  chatbotConfig = {
    title: 'Assistant IA Assurance',
    subtitle: 'Votre assistant intelligent pour gérer produits, garanties, packs et configurations d\'assurance.',
    features: [
      'Création de garanties',
      'Gestion des packs',
      'Configuration des produits',
      'Recommandations intelligentes'
    ],
    intents: [
      { icon: 'bi-box', label: 'CREATE_PRODUIT', description: 'Créer des produits d\'assurance' },
      { icon: 'bi-shield-check', label: 'CREATE_GARANTIE', description: 'Créer des garanties' },
      { icon: 'bi-collection', label: 'CREATE_PACK', description: 'Créer des packs' },
      { icon: 'bi-gear', label: 'CONFIGURE_PACK', description: 'Configurer des packs avec garanties' },
      { icon: 'bi-lightbulb', label: 'RECOMMENDATION', description: 'Obtenir des recommandations' }
    ]
  };

  private chatbotSubscription?: Subscription;

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly toastService: ToastService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly router: Router,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    console.log('ChatbotComponent: ngOnInit started');
    
    try {
      this.breadcrumbService.setBreadcrumb([
        { label: 'Accueil', routerLink: ['/dashboard'], icon: 'pi pi-home' },
        { label: 'Assistant IA', icon: 'pi pi-robot' }
      ]);

      console.log('ChatbotComponent: breadcrumb set');

      // Message de bienvenue
      const welcomeMessage = `🤖 **${this.chatbotConfig.title}**

${this.chatbotConfig.subtitle}

**Fonctionnalités disponibles :**
${this.chatbotConfig.features.map(f => `✅ ${f}`).join('\n')}

**Comment m'utiliser :**
- Soyez précis dans votre demande
- Mentionnez les caractéristiques souhaitées (prix, couverture, durée)
- Je détecterai automatiquement votre intention

**Exemples :**
- "Crée une garantie hospitalisation avec 90% de remboursement"
- "Je veux un pack santé à 50€ par mois"
- "Recommande-moi le meilleur produit pour une famille"

Comment puis-je vous aider aujourd'hui ?`;
      
      this.addBotMessage(welcomeMessage);
      console.log('ChatbotComponent: welcome message added');
    } catch (error) {
      console.error('ChatbotComponent: Error in ngOnInit', error);
    }
  }

  ngOnDestroy(): void {
    if (this.chatbotSubscription) {
      this.chatbotSubscription.unsubscribe();
    }
  }

  sendMessage(): void {
    console.log('ChatbotComponent: sendMessage called', { message: this.currentMessage, isLoading: this.isLoading });
    
    if (!this.currentMessage.trim() || this.isLoading) {
      console.log('ChatbotComponent: sendMessage early return');
      return;
    }

    const userMessage = this.currentMessage.trim();
    console.log('ChatbotComponent: Adding user message', userMessage);
    this.addUserMessage(userMessage);
    this.currentMessage = '';
    this.isLoading = true;

    // Traiter le message avec le chatbot unifié
    console.log('ChatbotComponent: Calling chatbot service');
    this.chatbotService.processPrompt({ prompt: userMessage }).subscribe({
      next: (response) => {
        console.log('ChatbotComponent: Chatbot response received', response);
        this.handleChatbotResponse(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('ChatbotComponent: Chatbot service error', error);
        this.addBotMessage('❌ Erreur de communication avec l\'assistant. Veuillez réessayer.');
        this.toastService.showError('Erreur chatbot', 'Communication impossible');
        this.isLoading = false;
      }
    });
  }

  private handleChatbotResponse(response: ChatbotResponse): void {
    let message = response.message;

    // Ajouter les informations de validation si présentes
    if (response.validation) {
      if (response.validation.errors.length > 0) {
        message += '\n\n❌ **Erreurs :**\n' + response.validation.errors.map(e => `• ${e}`).join('\n');
      }
      if (response.validation.warnings.length > 0) {
        message += '\n\n⚠️ **Avertissements :**\n' + response.validation.warnings.map(w => `• ${w}`).join('\n');
      }
    }

    // Ajouter les données structurées si présentes
    if (response.data) {
      message += this.formatDataForDisplay(response.data);
    }

    this.addBotMessage(message, response.intent, response.actions);
  }

  private formatDataForDisplay(data: ChatbotResponse['data']): string {
    if (!data) return '';

    let formatted = '\n\n---\n\n';

    if (data.produit) {
      const produit = data.produit as { nomProduit: string; description: string; typeProduit: string; statut: string };
      formatted += `📦 **Produit proposé :**\n`;
      formatted += `• Nom : ${produit.nomProduit}\n`;
      formatted += `• Description : ${produit.description}\n`;
      formatted += `• Type : ${produit.typeProduit}\n`;
      formatted += `• Statut : ${produit.statut}\n`;
    }

    if (data.garantie) {
      const garantie = data.garantie as { nomGarantie: string; description: string; typeGarantie: string; tauxRemboursement: number; statut: string };
      formatted += `🛡️ **Garantie proposée :**\n`;
      formatted += `• Nom : ${garantie.nomGarantie}\n`;
      formatted += `• Description : ${garantie.description}\n`;
      formatted += `• Type : ${garantie.typeGarantie}\n`;
      formatted += `• Taux : ${(garantie.tauxRemboursement * 100).toFixed(0)}%\n`;
      formatted += `• Statut : ${garantie.statut}\n`;
    }

    if (data.pack) {
      const pack = data.pack as { nomPack: string; description: string; prixMensuel: number; niveauCouverture: string; statut: string };
      formatted += `📦 **Pack proposé :**\n`;
      formatted += `• Nom : ${pack.nomPack}\n`;
      formatted += `• Description : ${pack.description}\n`;
      formatted += `• Prix : ${pack.prixMensuel}€/mois\n`;
      formatted += `• Niveau : ${pack.niveauCouverture}\n`;
      formatted += `• Statut : ${pack.statut}\n`;
    }

    if (data.recommendations) {
      formatted += `💡 **Recommandations :**\n`;
      data.recommendations.forEach((rec: unknown, index: number) => {
        const recObj = rec as { title: string; type: string; description: string; price?: number; features?: string[] };
        formatted += `\n**${index + 1}. ${recObj.title}**\n`;
        formatted += `• Type : ${recObj.type}\n`;
        formatted += `• Description : ${recObj.description}\n`;
        if (recObj.price) formatted += `• Prix : ${recObj.price}€\n`;
        if (recObj.features) formatted += `• Fonctionnalités : ${recObj.features.join(', ')}\n`;
      });
    }

    return formatted;
  }

  executeAction(action: { type: 'CREATE' | 'UPDATE' | 'DELETE' | 'NAVIGATE' | 'LIST'; label: string; data?: unknown; route?: string[] }): void {
    switch (action.type) {
      case 'CREATE':
        this.executeCreateAction(action as { type: 'CREATE'; label: string; data?: unknown });
        break;
      case 'NAVIGATE':
        if (action.route) {
          this.router.navigate(action.route);
        }
        break;
      default:
        this.toastService.showInfo('Action non implémentée', `Type : ${action.type}`);
    }
  }

  private executeCreateAction(action: { type: 'CREATE'; label: string; data?: unknown }): void {
    this.isLoading = true;

    // Simuler la création via le chatbot
    this.chatbotService.processPrompt({ prompt: `Créer ${action.label}` }).subscribe({
      next: (response) => {
        this.addBotMessage(response.message);
        if (response.success) {
          this.toastService.showSuccess(`${action.label} créé avec succès`);
        } else {
          this.toastService.showError('Échec création', response.error || 'Erreur inconnue');
        }
        this.isLoading = false;
      },
      error: (error) => {
        const errorMessage = error?.message || 'Erreur de communication';
        this.addBotMessage(`❌ **Erreur de communication**\n\n${errorMessage}`);
        this.toastService.showError('Erreur communication', errorMessage);
        this.isLoading = false;
      }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    } else if (event.key === 'Enter' && event.shiftKey) {
      // Allow newline with Shift+Enter
      const target = event.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;

      target.value = value.substring(0, start) + '\n' + value.substring(end);
      target.selectionStart = target.selectionEnd = start + 1;

      event.preventDefault();
    }
  }

  clearChat(): void {
    this.messages = [];
    this.ngOnInit();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private addUserMessage(text: string): void {
    this.messages.push({
      id: this.generateId(),
      sender: 'user',
      text,
      timestamp: new Date()
    });
  }

  private addBotMessage(text: string, intent?: ChatbotIntent, actions?: Array<{ type: 'CREATE' | 'UPDATE' | 'DELETE' | 'NAVIGATE' | 'LIST'; label: string; data?: unknown; route?: string[] }>): void {
    this.messages.push({
      id: this.generateId(),
      sender: 'bot',
      text,
      timestamp: new Date(),
      intent,
      actions
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getIntentIcon(intent?: ChatbotIntent): string {
    const icons: Record<ChatbotIntent, string> = {
      [ChatbotIntent.CREATE_PRODUIT]: 'bi-box',
      [ChatbotIntent.CREATE_GARANTIE]: 'bi-shield-check',
      [ChatbotIntent.CREATE_PACK]: 'bi-collection',
      [ChatbotIntent.CONFIGURE_PACK]: 'bi-gear',
      [ChatbotIntent.CREATE_PACK_WITH_GARANTIES]: 'bi-layers',
      [ChatbotIntent.UPDATE_PRODUIT]: 'bi-pencil',
      [ChatbotIntent.UPDATE_GARANTIE]: 'bi-pencil',
      [ChatbotIntent.UPDATE_PACK]: 'bi-pencil',
      [ChatbotIntent.DELETE_PRODUIT]: 'bi-trash',
      [ChatbotIntent.DELETE_GARANTIE]: 'bi-trash',
      [ChatbotIntent.DELETE_PACK]: 'bi-trash',
      [ChatbotIntent.LIST_PRODUITS]: 'bi-list',
      [ChatbotIntent.LIST_GARANTIES]: 'bi-list',
      [ChatbotIntent.LIST_PACKS]: 'bi-list',
      [ChatbotIntent.RECOMMENDATION]: 'bi-lightbulb',
      [ChatbotIntent.HELP]: 'bi-question-circle',
      [ChatbotIntent.UNKNOWN]: 'bi-question'
    };
    return icons[intent || ChatbotIntent.UNKNOWN] || 'bi-question';
  }

  getIntentBadge(intent?: ChatbotIntent): string {
    const badges: Record<ChatbotIntent, string> = {
      [ChatbotIntent.CREATE_PRODUIT]: 'p-tag-info',
      [ChatbotIntent.CREATE_GARANTIE]: 'p-tag-success',
      [ChatbotIntent.CREATE_PACK]: 'p-tag-warning',
      [ChatbotIntent.CONFIGURE_PACK]: 'p-tag-danger',
      [ChatbotIntent.CREATE_PACK_WITH_GARANTIES]: 'p-tag-primary',
      [ChatbotIntent.UPDATE_PRODUIT]: 'p-tag-info',
      [ChatbotIntent.UPDATE_GARANTIE]: 'p-tag-success',
      [ChatbotIntent.UPDATE_PACK]: 'p-tag-warning',
      [ChatbotIntent.DELETE_PRODUIT]: 'p-tag-danger',
      [ChatbotIntent.DELETE_GARANTIE]: 'p-tag-danger',
      [ChatbotIntent.DELETE_PACK]: 'p-tag-danger',
      [ChatbotIntent.LIST_PRODUITS]: 'p-tag-secondary',
      [ChatbotIntent.LIST_GARANTIES]: 'p-tag-secondary',
      [ChatbotIntent.LIST_PACKS]: 'p-tag-secondary',
      [ChatbotIntent.RECOMMENDATION]: 'p-tag-secondary',
      [ChatbotIntent.HELP]: 'p-tag-help',
      [ChatbotIntent.UNKNOWN]: 'p-tag-contrast'
    };
    return badges[intent || ChatbotIntent.UNKNOWN] || 'p-tag-contrast';
  }

  formatMessage(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/\n/g, '<br>');
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  trackByActionLabel(index: number, action: any): string {
    return action.label;
  }

  trackByIntentLabel(index: number, intent: any): string {
    return intent.label;
  }

  getIntentExample(intentLabel: string): string {
    const examples = {
      'CREATE_PRODUIT': 'Créer un nouveau produit d\'assurance',
      'CREATE_GARANTIE': 'Créer une garantie hospitalisation',
      'CREATE_PACK': 'Créer un pack santé',
      'CONFIGURE_PACK': 'Configurer un pack avec garanties',
      'CREATE_PACK_WITH_GARANTIES': 'Créer un pack complet',
      'UPDATE_PRODUIT': 'Modifier un produit existant',
      'UPDATE_GARANTIE': 'Mettre à jour une garantie',
      'UPDATE_PACK': 'Modifier un pack',
      'DELETE_PRODUIT': 'Supprimer un produit',
      'DELETE_GARANTIE': 'Supprimer une garantie',
      'DELETE_PACK': 'Supprimer un pack',
      'LIST_PRODUITS': 'Lister tous les produits',
      'LIST_GARANTIES': 'Voir les garanties',
      'LIST_PACKS': 'Afficher les packs',
      'RECOMMENDATION': 'Recommander un produit',
      'HELP': 'Aide',
      'UNKNOWN': 'Aide'
    };
    return examples[intentLabel as keyof typeof examples] || 'Aide';
  }

  getActionIcon(actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'NAVIGATE' | 'LIST' | string): string {
    const icons: Record<string, string> = {
      'CREATE': 'bi-plus-circle',
      'UPDATE': 'bi-pencil',
      'DELETE': 'bi-trash',
      'NAVIGATE': 'bi-arrow-right',
      'LIST': 'bi-list'
    };
    return icons[actionType] || 'bi-circle';
  }
}
