# Documentation Complète - Séparation des Chatbots
## 🏗️ **CHANGEMENTS BACKEND**
### 1. **Nouveau Fichier : `recommendation_chatbot.py`**
**Emplacement :** `ai-service/chatbot/recommendation_chatbot.py`
**Fonctionnalités :**
- Classe `RecommendationChatbot` spécialisée dans les recommandations
- Extraction NLP pour les données client (âge, sexe, profession, etc.)
- Gestion des champs conditionnels (diabète, tension si maladie chronique)
- Calcul de progression de la conversation
- Communication avec le service de recommandation (port 9095)
- Génération de résumé de profil utilisateur

**Méthodes principales :**
```python
class RecommendationChatbot:
    def __init__(self)
    def get_welcome_message(self) -> dict
    def process_message(self, message: str, history: list, client_id: str = "") -> dict
    def _extract_collected_data(self, history: list, fields: dict) -> dict
    def _calculate_progress(self, collected_data: dict, fields: dict) -> int
    def _finalize_recommendation(self, collected_data: dict, client_id: str = "") -> dict
    def get_user_profile_summary(self, collected_data: dict) -> str
```

### 2. **Fichier Existant : `chatbot_engine.py`**
**Modifications :** Aucune modification - le chatbot d'administration reste intact

**Fonctionnalités conservées :**
- Mode création pour garanties, produits, packs
- Mode recommandation (compatibilité maintenue)
- Validation stricte et confirmation
- Gestion des entités administratives

### 3. **Nouveau Fichier : `app_separated.py`**
**Emplacement :** `ai-service/app_separated.py`

**Fonctionnalités :**
- Serveur Flask avec endpoints séparés pour chaque chatbot
- Initialisation des deux chatbots (recommandation + admin)
- CORS activé pour le frontend Angular
- Gestion centralisée des erreurs

**Endpoints API :**
```python
# Chatbot de recommandation
@app.route('/api/recommendation-chat/start', methods=['POST'])
@app.route('/api/recommendation-chat', methods=['POST'])

# Chatbot d'administration  
@app.route('/api/admin-chat/start', methods=['POST'])
@app.route('/api/admin-chat', methods=['POST'])

# Santé du service
@app.route('/api/health', methods=['GET'])
```

### 4. **Tests Backend**
**Nouveau fichier :** `ai-service/test_integration.py`
- Tests d'intégration complets
- Validation des endpoints API
- Simulation de conversations complètes
- Tests de santé du service
---
## 🎨 **CHANGEMENTS FRONTEND**

### 1. **Services Angular**

#### A. **Nouveau : `recommendation-chatbot.service.ts`**
**Emplacement :** `frontend/src/app/shared/services/recommendation-chatbot.service.ts`

**Interfaces :**
```typescript
export interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
  time: Date;
}

export interface ChatRequest {
  message: string;
  conversation_history: Array<{role: 'user' | 'assistant', content: string}>;
  client_id?: string;
}

export interface ChatResponse {
  response: string;
  collected_data?: any;
  is_complete: boolean;
  next_field?: string;
  progress?: number;
  recommendations?: any;
}
```

**Méthodes :**
```typescript
export class RecommendationChatbotService {
  chat(request: ChatRequest): Observable<ChatResponse>
  startConversation(clientId?: string): Observable<ChatResponse>
  getPackDetails(packId: string): Observable<any>
  formatHistory(messages: ChatMessage[]): Array<{role: 'user' | 'assistant', content: string}>
  generateProfileSummary(collectedData: any): string
}
```

#### B. **Nouveau : `admin-chatbot.service.ts`**
**Emplacement :** `frontend/src/app/shared/services/admin-chatbot.service.ts`

**Interfaces spécifiques admin :**
```typescript
export interface AdminChatMessage {
  text: string;
  sender: 'user' | 'ai';
  time: Date;
}

export interface AdminChatRequest {
  message: string;
  conversation_history: Array<{role: 'user' | 'assistant', content: string}>;
  mode: 'creation' | 'admin';
}

export interface AdminChatResponse {
  response: string;
  collected_data?: any;
  is_complete: boolean;
  next_field?: string;
  progress?: number;
  validation_errors?: string[];
  awaiting_confirmation?: boolean;
  awaiting_correction?: boolean;
}
```

### 2. **Composants Client**

#### A. **Mise à jour : `chatbot.component.ts`**
**Emplacement :** `frontend/src/app/client/chatbot/chatbot.component.ts`

**Changements majeurs :**
- Import de `RecommendationChatbotService` au lieu de `AiService`
- Nouvelles propriétés : `progress`, `isComplete`, `collectedData`, `recommendations`, `showSummary`
- Méthode `startConversation()` pour initialiser le chatbot
- Méthode `getProfileSummary()` pour afficher le profil
- Méthode `viewPackDetails()` pour voir les détails des packs
- Méthode `resetConversation()` pour recommencer
- Méthode `formatMessage()` pour le rendu HTML sécurisé

**Nouvelles fonctionnalités UI :**
- Barre de progression en temps réel
- Résumé du profil utilisateur pliable
- Affichage des packs recommandés avec scores
- Boutons de détails pour chaque pack
- Bouton de réinitialisation

#### B. **Mise à jour : `chatbot.component.html`**
**Nouveaux éléments :**
```html
<!-- Barre de progression -->
<div class="progress-container" *ngIf="progress > 0 && !isComplete">
  <div class="progress-bar">
    <div class="progress-fill" [style.width.%]="progress"></div>
  </div>
  <span class="progress-text">{{ progress }}% complété</span>
</div>

<!-- Résumé du profil -->
<div class="profile-summary" *ngIf="hasCollectedData">
  <div class="summary-header">
    <h4>Votre Profil</h4>
    <button class="toggle-summary" (click)="showSummary = !showSummary">
      {{ showSummary ? 'Cacher' : 'Voir' }} le résumé
    </button>
  </div>
  <div class="summary-content" *ngIf="showSummary" [innerHTML]="getProfileSummary()"></div>
</div>

<!-- Recommandations -->
<div class="recommendations" *ngIf="recommendations.length > 0">
  <h4>Packs Recommandés</h4>
  <div class="pack-list">
    <div *ngFor="let pack of recommendations" class="pack-item">
      <div class="pack-info">
        <h5>{{ pack.nomPack }}</h5>
        <p>Score : {{ pack.score }}/100</p>
        <div class="pack-reasons" *ngIf="pack.raisons && pack.raisons.length > 0">
          <small *ngFor="let raison of pack.raisons.slice(0, 2)">• {{ raison }}</small>
        </div>
      </div>
      <button class="details-btn" (click)="viewPackDetails(pack.idPack)">
        Détails
      </button>
    </div>
  </div>
</div>
```

#### C. **Mise à jour : `chatbot.component.css`**
**Nouveaux styles :**
- Styles pour la barre de progression animée
- Styles pour le résumé de profil avec accordéon
- Styles pour les cartes de recommandation
- Styles pour l'indicateur de chargement animé
- Design responsive pour mobile

### 3. **Composants Administration**

#### A. **Nouveau : `recommendation-chat.component.ts`**
**Emplacement :** `frontend/src/app/admin/recommendation-chat/recommendation-chat.component.ts`

**Spécificités admin :**
- Breadcrumb spécifique : "Chat Recommandation"
- Couleur bleue distinctive (#2b6cb0)
- Libellés adaptés pour l'admin ("Profil Client", "Packs Recommandés pour ce Client")
- Méthode `hasCollectedData` pour une meilleure gestion des états

#### B. **Nouveau : `recommendation-chat.component.html`**
**Adaptations UI :**
- En-tête "Chat de Recommandation"
- Icônes spécifiques pour les recommandations (🎯)
- Styles cohérents avec l'interface admin

#### C. **Nouveau : `recommendation-chat.component.css`**
**Styles spécifiques admin :**
- Palette de couleurs bleue pour distinguer du chat client
- Bordures et ombres adaptées au thème admin
- Responsive optimisé pour les écrans d'administration

#### D. **Mise à jour : `admin-chat.component.ts`**
**Changements :**
- Import de `AdminChatbotService` au lieu de `AiService`
- Utilisation des interfaces `AdminChatMessage` et `AdminChatRequest`
- Mode 'creation' explicite dans les appels API
- Gestion des choix suggérés dynamiques

### 4. **Routing et Modules**

#### A. **Mise à jour : `admin-routing.module.ts`**
**Nouvelles routes :**
```typescript
{ path: 'chat', component: AdminChatComponent, data: { breadcrumb: 'Chat Création' } },
{ path: 'recommendation-chat', component: RecommendationChatComponent, data: { breadcrumb: 'Chat Recommandation' } },
```

#### B. **Mise à jour : `admin.module.ts`**
**Nouvelles déclarations :**
```typescript
import { RecommendationChatComponent } from './recommendation-chat/recommendation-chat.component';

@NgModule({
  declarations: [
    // ... autres composants
    RecommendationChatComponent,
  ]
})
```

---

## 🔧 **CONFIGURATION ET DÉPLOIEMENT**

### 1. **Variables d'Environnement**
**Backend :**
```bash
RECOMMENDATION_SERVICE_URL=http://localhost:9095
PRODUCT_SERVICE_URL=http://localhost:9093
PORT=5000
DEBUG=False
```

**Frontend :**
```typescript
// api-config.ts
export const API_CONFIG = {
  ai: 'http://localhost:5000/api',
  recommendation: 'http://localhost:9095/api/recommendations',
  // ... autres services
};
```

### 2. **Démarrage des Services**

**Backend (nouveau service séparé) :**
```bash
cd ai-service
python app_separated.py
```

**Frontend :**
```bash
cd frontend
ng serve
```

### 3. **Tests d'Intégration**
**Lancer les tests backend :**
```bash
cd ai-service
python test_integration.py
```

**Tests frontend :**
```bash
cd frontend
ng test
```

---

## 📊 **ARCHITECTURE FINALE**

### **Backend**
```
ai-service/
├── app_separated.py              # Serveur Flask avec endpoints séparés
├── test_integration.py           # Tests d'intégration
├── API_ENDPOINTS.md              # Documentation API
├── CHATBOT_ARCHITECTURE.md      # Documentation architecture
└── chatbot/
    ├── recommendation_chatbot.py # Chatbot recommandation séparé
    └── chatbot_engine.py      # Chatbot admin (inchangé)
```

### **Frontend**
```
frontend/src/app/
├── shared/services/
│   ├── recommendation-chatbot.service.ts  # Service recommandation
│   └── admin-chatbot.service.ts         # Service admin
├── client/
│   └── chatbot/              # Chatbot client mis à jour
└── admin/
    ├── admin-chat/            # Chatbot admin mis à jour
    ├── recommendation-chat/    # NOUVEAU: Chatbot recommandation admin
    ├── admin-routing.module.ts # Routes mises à jour
    └── admin.module.ts        # Module mis à jour
```

---

## 🎯 **AVANTAGES DE LA SÉPARATION**

### 1. **Maintenabilité**
- Code modulaire et spécialisé
- Responsabilités claires
- Tests isolés
- Débogage simplifié

### 2. **Performance**
- Chargement optimisé
- Services dédiés
- Moins de dépendances
- Scalabilité améliorée

### 3. **Sécurité**
- Droits d'accès différenciés
- Isolation des données
- Audit trail séparé
- Moins de surface d'attaque

### 4. **Évolutivité**
- Ajout facile de nouveaux chatbots
- Extensions indépendantes
- Déploiement modulaire
- Tests parallèles possibles

---

## 🚀 **UTILISATION**

### **Accès aux Chatbots**

**Pour les clients :**
- URL : `/client/chatbot`
- Fonction : Recommandation de packs d'assurance

**Pour les administrateurs :**
- URL : `/admin/chat` - Chat de création (garanties, produits, packs)
- URL : `/admin/recommendation-chat` - Chat de recommandation (test/démo)

### **Flux de Travail**

1. **Administrateur crée des entités** via `/admin/chat`
2. **Système de recommandation** utilise ces entités
3. **Client obtient des recommandations** via `/client/chatbot`
4. **Administrateur peut tester** les recommandations via `/admin/recommendation-chat`

---

## 🔍 **POINTS DE VALIDATION**

### **Backend**
- [ ] Service démarre sur port 5000
- [ ] Endpoint `/api/health` répond
- [ ] Chatbot recommandation fonctionne
- [ ] Chatbot administration fonctionne
- [ ] Tests d'intégration passent

### **Frontend**
- [ ] Compilation Angular réussie
- [ ] Routes accessibles
- [ ] Services injectés correctement
- [ ] Interface responsive
- [ ] Tests unitaires passent

### **Intégration**
- [ ] Communication frontend-backend établie
- [ ] Données échangées correctement
- [ ] Erreurs gérées proprement
- [ ] UX fluide et intuitive

---

Cette séparation offre une architecture robuste, maintenable et évolutive pour le système de chatbots Vermeg !
