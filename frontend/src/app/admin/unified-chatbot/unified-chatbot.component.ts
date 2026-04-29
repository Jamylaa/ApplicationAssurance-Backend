import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { AiChatService, ChatMessage, ChatSession, ChatResponse, RecommendationRequest, AdminChatRequest, PackCreationRequest, GarantieCreationRequest } from '../../core/services/ai-chat.service';

@Component({
    selector: 'app-unified-chatbot',
    templateUrl: './unified-chatbot.component.html',
    styleUrls: ['./unified-chatbot.component.css'],
    standalone: true,
  imports: [TabViewModule, NgClass, NgFor, NgIf, FormsModule, ReactiveFormsModule, InputTextModule, ButtonDirective, RadioButtonModule, MessageModule, InputTextareaModule, DatePipe],
  providers: [AiChatService]
})
export class UnifiedChatbotComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // UI State
  activeTab: number = 0;
  loading: boolean = false;
  messages: ChatMessage[] = [];
  userInput: string = '';
  
  // Chat Types
  readonly chatTypes = [
    { label: 'Recommandation', value: 'recommendation' },
    { label: 'Administration', value: 'admin' },
    { label: 'Création Pack', value: 'pack' },
    { label: 'Création Garantie', value: 'garantie' }
  ];
  
  // Forms
  chatForm!: FormGroup;
  adminForm!: FormGroup;
  
  // Current session info
  currentChatType: string = 'recommendation';
  currentSession: ChatSession | null = null;
  
  constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private readonly aiChatService: AiChatService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.setupSessionManagement();
    this.startNewChat();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // Chat form for recommendation and single prompt chats
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2000)]],
      clientId: ['']
    });

    // Admin chat form with mode selection
    this.adminForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2000)]],
      mode: ['creation', Validators.required]
    });
  }

  private setupSessionManagement(): void {
    this.aiChatService.getCurrentSession().pipe(
      takeUntil(this.destroy$)
    ).subscribe((session: ChatSession | null) => {
      this.currentSession = session;
      if (session) {
        this.messages = session.messages;
        this.currentChatType = session.type;
      }
    });
  }

  onTabChange(event: any): void {
    this.activeTab = event.index;
    this.currentChatType = this.chatTypes[event.index].value;
    this.startNewChat();
  }

  startNewChat(): void {
    const session = this.aiChatService.createNewSession(this.currentChatType as any);
    this.messages = [];
    this.loading = true;

    // Start appropriate chat based on type
    switch (this.currentChatType) {
      case 'recommendation':
        this.startRecommendationChat();
        break;
      case 'admin':
        this.startAdminChat();
        break;
      case 'pack':
      case 'garantie':
        // Single prompt chats don't need initialization
        this.loading = false;
        break;
    }
  }

  private startRecommendationChat(): void {
    this.aiChatService.startRecommendationChat().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        this.handleChatResponse(response);
        this.loading = false;
      },
      error: (error: any) => {
        this.handleError(error);
        this.loading = false;
      }
    });
  }

  private startAdminChat(): void {
    this.aiChatService.startAdminChat().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        this.handleChatResponse(response);
        this.loading = false;
      },
      error: (error: any) => {
        this.handleError(error);
        this.loading = false;
      }
    });
  }

  sendMessage(): void {
    if (this.loading) return;

    let request: RecommendationRequest | AdminChatRequest | PackCreationRequest | GarantieCreationRequest | null = null;
    let messageText = '';

    switch (this.currentChatType) {
      case 'recommendation': {
        const recommendationData = this.chatForm.value;
        request = {
          message: recommendationData.message,
          conversation_history: this.messages,
          client_id: recommendationData.clientId
        };
        messageText = recommendationData.message;
        break;
      }

      case 'admin': {
        const adminData = this.adminForm.value;
        request = {
          message: adminData.message,
          conversation_history: this.messages,
          mode: adminData.mode
        };
        messageText = adminData.message;
        break;
      }

      case 'pack': {
        const prompt = this.chatForm.value.message;
        request = { prompt };
        messageText = prompt;
        break;
      }

      case 'garantie': {
        const prompt = this.chatForm.value.message;
        request = { prompt };
        messageText = prompt;
        break;
      }

      default:
        return;
    }

    if (!request) {
      return;
    }

    const validation = this.currentChatType === 'admin'
      ? this.aiChatService.validateAdminRequest(request as AdminChatRequest)
      : this.aiChatService.validatePrompt(messageText);

    if (!validation.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de validation',
        detail: validation.error
      });
      return;
    }

    // Add user message
    this.addMessage(messageText, true);
    this.loading = true;

    // Send request based on chat type
    switch (this.currentChatType) {
      case 'recommendation':
        this.sendRecommendationMessage(request as RecommendationRequest);
        break;
      case 'admin':
        this.sendAdminMessage(request as AdminChatRequest);
        break;
      case 'pack':
        this.createPackFromPrompt((request as PackCreationRequest).prompt);
        break;
      case 'garantie':
        this.createGarantieFromPrompt((request as GarantieCreationRequest).prompt);
        break;
    }
  }

  private sendRecommendationMessage(request: RecommendationRequest): void {
    this.aiChatService.sendRecommendationMessage(request).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => this.handleChatResponse(response),
      error: (error: any) => this.handleError(error)
    });
  }

  private sendAdminMessage(request: AdminChatRequest): void {
    this.aiChatService.sendAdminMessage(request).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => this.handleChatResponse(response),
      error: (error: any) => this.handleError(error)
    });
  }

  private createPackFromPrompt(prompt: string): void {
    this.aiChatService.createPackFromPrompt(prompt).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => this.handleChatResponse(response),
      error: (error: any) => this.handleError(error)
    });
  }

  private createGarantieFromPrompt(prompt: string): void {
    this.aiChatService.createGarantieFromPrompt(prompt).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => this.handleChatResponse(response),
      error: (error: any) => this.handleError(error)
    });
  }

  private handleChatResponse(response: ChatResponse): void {
    this.addMessage(response.response, false);
    this.loading = false;

    if (response.error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: response.error
      });
    }

    // Handle completion for single prompt chats
    if (response.is_complete && ['pack', 'garantie'].includes(this.currentChatType)) {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Création terminée avec succès'
      });
    }
  }

  private handleError(error: any): void {
    const response = this.aiChatService.handleChatError(error);
    this.addMessage(response.response, false);
    this.loading = false;

    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: response.error || 'Une erreur est survenue'
    });
  }

  private addMessage(message: string, isUser: boolean): void {
    const chatMessage: ChatMessage = {
      message,
      isUser,
      timestamp: new Date()
    };

    this.messages.push(chatMessage);
    this.aiChatService.addMessageToSession(message, isUser);
  }

  resetChat(): void {
    if (this.currentChatType === 'admin') {
      this.aiChatService.resetAdminChat().pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.startNewChat();
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Chat administrateur réinitialisé'
          });
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de réinitialiser le chat'
          });
        }
      });
    } else {
      this.startNewChat();
    }
  }

  clearAll(): void {
    this.aiChatService.clearCurrentSession();
    this.messages = [];
    this.chatForm.reset();
    this.adminForm.reset();
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Chat effacé'
    });
  }

  get currentForm(): FormGroup {
    return this.currentChatType === 'admin' ? this.adminForm : this.chatForm;
  }

  get isSinglePromptChat(): boolean {
    return ['pack', 'garantie'].includes(this.currentChatType);
  }

  get placeholder(): string {
    switch (this.currentChatType) {
      case 'recommendation':
        return 'Décrivez vos besoins d\'assurance...';
      case 'admin':
        return 'Décrivez la modification à apporter...';
      case 'pack':
        return 'Décrivez le pack d\'assurance à créer...';
      case 'garantie':
        return 'Décrivez la garantie à créer...';
      default:
        return 'Tapez votre message...';
    }
  }

  get helpText(): string {
    switch (this.currentChatType) {
      case 'recommendation':
        return 'Je vous aiderai à trouver le meilleur produit d\'assurance selon vos besoins.';
      case 'admin':
        return 'Je vous aidera à créer ou modifier des produits, packs et garanties.';
      case 'pack':
        return 'Décrivez en détail le pack d\'assurance que vous souhaitez créer.';
      case 'garantie':
        return 'Décrivez en détail la garantie que vous souhaitez créer.';
      default:
        return '';
    }
  }
}
