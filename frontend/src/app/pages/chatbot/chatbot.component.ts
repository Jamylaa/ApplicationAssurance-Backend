import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotService, ChatbotResponse } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  messages: Array<{sender: 'user' | 'bot', text: string, timestamp: Date}> = [];
  currentMessage: string = '';
  isLoading: boolean = false;
  chatbotTitle: string = 'Assistant IA Assurance';
  chatbotDescription: string = 'Créez des garanties, packs et produits avec notre assistant intelligent';

  constructor(
    private router: Router,
    private chatbotService: ChatbotService
  ) {}

  ngOnInit(): void {
    this.addBotMessage('🤖 Bonjour ! Je suis votre assistant IA pour l\'assurance.\n\nJe peux vous aider à créer :\n• Garanties (hospitalisation, dentaire, optique...)\n• Packs d\'assurance (santé, famille, premium...)\n• Produits d\'assurance\n\nDécrivez simplement ce que vous souhaitez créer en langage naturel.\n\nExemple : "Créer une garantie hospitalisation premium avec 90% de remboursement"');

    // Vérifier la santé du service
    this.chatbotService.healthCheck().subscribe(response => {
      if (response.status === 'UNHEALTHY') {
        this.addBotMessage('⚠️ Le service backend n\'est pas disponible. Vérifiez que le serveur tourne sur localhost:9093.');
      }
    });
  }

  sendMessage(): void {
    const userMessage = this.currentMessage.trim();
    if (!userMessage) return;

    this.addUserMessage(userMessage);
    this.currentMessage = '';
    this.isLoading = true;

    // Utiliser le service unifié unique
    this.chatbotService.processPrompt(userMessage).subscribe({
      next: (response: ChatbotResponse) => {
        if (response.success) {
          let messageText = `✅ ${response.message || 'Opération réussie'}`;

          // Afficher les détails de l'entité créée si disponible
          if (response.entity || response.pack) {
            messageText += this.chatbotService.formatEntityForDisplay(response);
          }

          this.addBotMessage(messageText);
        } else {
          this.addBotMessage(`❌ Erreur: ${response.error || 'Erreur inconnue'}`);
          if (response.details) {
            this.addBotMessage(`Détails: ${response.details}`);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Chatbot error:', error);
        this.addBotMessage('❌ Erreur de communication avec le chatbot. Vérifiez que le backend fonctionne sur localhost:9093.');
        this.isLoading = false;
      }
    });
  }

  private addUserMessage(text: string): void {
    this.messages.push({
      sender: 'user',
      text: text,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private addBotMessage(text: string): void {
    this.messages.push({
      sender: 'bot',
      text: text,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  formatMessage(text: string): string {
    // Convertir les sauts de ligne en <br>
    let formatted = text.replace(/\n/g, '<br>');

    // Mettre en gras le texte entre ** **
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convertir le texte entre ` ` en code inline
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

    return formatted;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.messages = [];
    this.addBotMessage('🤖 Bonjour ! Je suis votre assistant IA pour l\'assurance.\n\nJe peux vous aider à créer des garanties, packs et produits.\n\nComment puis-je vous aider ?');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Exemples de prompts pour l'utilisateur
  examplePrompts = [
    'Créer une garantie hospitalisation premium active avec un remboursement de 90% sur les frais réels, un plafond annuel de 50000, mensuel de 10000 et par acte de 5000,avec une franchise de 100,un coût moyen par sinistre de 2000, une durée de contrat entre 12 et 60 mois, résiliable chaque année.',
    'Créer un pack santé économique intitulé "Santé Basic" pour le produit SANTE, destiné exclusivement aux individus âgés de 18 à 60 ans, avec une couverture locale, un prix mensuel de 45, une durée de contrat allant de 6 à 36 mois, un niveau BASIC et un statut ACTIF. Ajouter deux garanties à ce pack : la première est la Consultation médecin généraliste, obligatoire, avec un taux de remboursement de 80 %, un plafond mensuel de 150 et une franchise de 10 , la seconde est l\'Hospitalisation Éco, optionnelle, avec un taux de remboursement de 50 %, un plafond de 20 000 et une franchise de 300.',
    'une garantie dentaire active qui rembourse 70% sur tarif conventionné, avec un plafond annuel de 2000, mensuel de 300 et par acte de 150, une franchise de 20, coût moyen de 120,et une drée de contrat entre 6 et 36 mois, résiliable annuellement.',
    'Créer un produit d’assurance santé nommé "Assurance Santé Plus", avec une description "Couverture médicale complète pour particuliers et familles", de type SANTE et avec statut ACTIF',
    'Créer une garantie optique avec franchise 50€',
    'Créer un produit habitation appelé "Pack Habitat Sécurisé", description "Protection complète du logement contre sinistres", type HABITATION, statut EN_ATTENTE'
  ];

  useExample(prompt: string): void {
    this.currentMessage = prompt;
    this.sendMessage();
  }
}
