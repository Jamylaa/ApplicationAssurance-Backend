import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-buttons.component.html',
  styleUrls: ['./chatbot-buttons.component.css']
})
export class ChatbotButtonsComponent {
  chatbots = [
    {
      id: 'recommendation',
      name: 'Assistant Recommandation',
      description: 'Obtenez des recommandations personnalisées',
      icon: 'bi-lightbulb',
      color: '#007bff',
      route: '/chatbot/recommendation'
    },
    {
      id: 'admin',
      name: 'Assistant Administration',
      description: 'Gérez produits, garanties et packs',
      icon: 'bi-gear',
      color: '#28a745',
      route: '/chatbot/admin'
    },
    {
      id: 'guarantee',
      name: 'Assistant Garanties',
      description: 'Créez des garanties d\'assurance',
      icon: 'bi-shield-check',
      color: '#fd7e14',
      route: '/chatbot/guarantee'
    },
    {
      id: 'assurance-nlp',
      name: 'Assistant IA Assurance',
      description: 'Transformez vos demandes en actions',
      icon: 'bi-robot',
      color: '#6f42c1',
      route: '/chatbot/assurance-nlp'
    }
  ];

  constructor(private router: Router) {}

  navigateToChatbot(chatbotType: string): void {
    this.router.navigate([`/chatbot/${chatbotType}`], {
      state: { type: chatbotType }
    });
  }

  openChatbot(chatbot: any): void {
    this.navigateToChatbot(chatbot.id);
  }
}
