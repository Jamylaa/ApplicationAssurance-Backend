# Documentation Complète - AI Service Vermeg

## Vue d'Ensemble

Le système AI Service Vermeg est une solution complète de chatbots et de recommandations pour le secteur de l'assurance. Il combine des chatbots spécialisés, des services de recommandation intelligents et une API robuste pour offrir une expérience utilisateur optimale.

---

## Architecture des Chatbots

Le système de chatbots Vermeg est organisé en deux modules distincts et spécialisés :

### 1. Chatbot de Recommandation (`recommendation_chatbot.py`)
**Rôle :** Aider les clients à trouver le pack d'assurance le plus adapté à leurs besoins.

**Fonctionnalités :**
- Collecte des informations personnelles (âge, profession, situation familiale)
- Évaluation des besoins spécifiques (maladies, budget, nombre de bénéficiaires)
- Communication avec le service de recommandation (port 9095)
- Présentation des packs recommandés avec scores

**Cas d'usage :**
- Clients finaux cherchant une assurance
- Interface publique du site web
- Application mobile

### 2. Chatbot d'Administration (`chatbot_engine.py`)
**Rôle :** Permettre aux administrateurs de créer et gérer les entités du système.

**Fonctionnalités :**
- Création de garanties
- Création de produits
- Création de packs
- Mode strict avec validation et confirmation
- Communication avec le service produit (port 9093)

**Cas d'usage :**
- Back-office administratif
- Gestion interne des produits
- Configuration des offres

### 3. Chatbot de Pack (`PackChatbot`)
**Rôle :** Assistant spécialisé pour la création de packs d'assurance avec parsing intelligent.

**Fonctionnalités :**
- Parsing intelligent des entrées utilisateur
- State machine fiable
- Validation stricte des données
- Gestion des erreurs et corrections

---

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Endpoints de Chatbot de Recommandation

#### Démarrer une conversation
```http
POST /recommendation-chat/start
Content-Type: application/json
{
  "client_id": "optional-client-id"
}
```

**Réponse :**
```json
{
  "response": "Bonjour ! Je suis votre assistant d'assurance santé...",
  "next_field": "age",
  "progress": 0,
  "is_complete": false,
  "collected_data": {}
}
```

#### Envoyer un message
```http
POST /recommendation-chat
Content-Type: application/json
{
  "message": "30 ans",
  "conversation_history": [
    {"role": "assistant", "content": "Quel est votre âge ?"},
    {"role": "user", "content": "30 ans"}
  ],
  "client_id": "optional-client-id"
}
```

**Réponse :**
```json
{
  "response": "Quel est votre sexe ? (Homme / Femme)",
  "next_field": "sexe", 
  "progress": 10,
  "is_complete": false,
  "collected_data": {"age": 30}
}
```

### Endpoints de Chatbot d'Administration

#### Démarrer une conversation
```http
POST /admin-chat/start
Content-Type: application/json
{}
```

**Réponse :**
```json
{
  "response": "Bonjour Administrateur. Je suis votre assistant de création...",
  "next_field": "admin_intent",
  "progress": 0,
  "is_complete": false,
  "collected_data": {}
}
```

#### Envoyer un message
```http
POST /admin-chat
Content-Type: application/json
{
  "message": "Garantie",
  "conversation_history": [
    {"role": "assistant", "content": "Que souhaitez-vous créer ?"},
    {"role": "user", "content": "Garantie"}
  ],
  "mode": "creation"
}
```

**Réponse :**
```json
{
  "response": "Quel nom souhaitez-vous donner à cette garantie ?",
  "next_field": "nom_garantie",
  "progress": 10,
  "is_complete": false,
  "collected_data": {"admin_intent": "Garantie"}
}
```

### Gestion des Erreurs

Tous les endpoints retournent des erreurs au format :
```json
{
  "error": "Message d'erreur",
  "details": "Informations détaillées sur l'erreur"
}
```

**Codes HTTP :**
- 200: Succès
- 400: Mauvaise requête
- 500: Erreur interne du serveur

---

## Guide d'Intégration - Pack Chatbot

### Problèmes Résolus

#### Avant (Problèmes)
- ❌ "2000DT" non compris → parsing échoue
- ❌ "24mois" non reconnu → durée invalide  
- ❌ "Oui"/"Non" parfois non reconnus
- ❌ Redemande des questions même si réponse correcte
- ❌ Décalage des champs (prix = âge, etc.)
- ❌ Validation fragile (duree_min = duree_max)
- ❌ Flux de conversation instable

#### Après (Solution)
- ✅ Parsing intelligent de tous les formats
- ✅ Validation stricte et claire
- ✅ Association garantie réponse/champ
- ✅ State machine explicite
- ✅ Gestion d'erreurs intelligente
- ✅ Résumé détaillé avant confirmation

### Architecture

#### State Machine
```
WELCOME → COLLECTING → VALIDATION → CONFIRMATION → CORRECTION → COMPLETED
```

#### Parsing Intelligent
- **Texte** : Nettoyage des espaces
- **Liste** : Gestion des séparateurs variés (`,`, `;`, espaces)
- **Entier** : Conversion d'unités (`1an` → `12mois`)
- **Float** : Nettoyage des symboles (`2000DT` → `2000.0`)
- **Booléen** : Reconnaissance des variations (`Oui`, `oui`, `O`, etc.)
- **Choice** : Mapping des variations (`basic` → `BASIC`)

### Intégration

#### 1. Import
```python
from chatbot.pack_chatbot import PackChatbot
```

#### 2. Initialisation
```python
chatbot = PackChatbot()
```

#### 3. API Flask (Exemple)
```python
@app.route('/api/pack-chat/start', methods=['POST'])
def start_pack_chat():
    chatbot = PackChatbot()  # Nouvelle instance
    return jsonify(chatbot.get_welcome_message())

@app.route('/api/pack-chat', methods=['POST'])
def pack_chat():
    data = request.get_json()
    message = data.get('message', '')
    
    # Récupérer ou créer l'instance du chatbot (session, base de données, etc.)
    chatbot = get_or_create_chatbot_session()
    
    response = chatbot.process_message(message)
    return jsonify(response)
```

### Formats d'Entrée Supportés

#### Prix
- ✅ `2000`
- ✅ `2000DT` 
- ✅ `2000.5`
- ✅ `2000.50DT`
- ❌ `deux mille` (non supporté)

#### Durée
- ✅ `24`
- ✅ `24mois`
- ✅ `24 mois`
- ✅ `2ans` (converti en `24mois`)
- ✅ `1an` (converti en `12mois`)

#### Booléen
- ✅ `Oui`, `oui`, `OUI`
- ✅ `Non`, `non`, `NON`
- ✅ `O`, `o`, `1`
- ✅ `N`, `n`, `0`
- ✅ `actif`, `inactif`

#### Niveau de Couverture
- ✅ `BASIC`, `basic`, `basique`
- ✅ `PREMIUM`, `premium`, `intermédiaire`
- ✅ `GOLD`, `gold`, `or`

#### Liste d'IDs
- ✅ `PROD001,PROD002`
- ✅ `PROD001; PROD002`
- ✅ `PROD001 PROD002`

### Validations

#### Par Champ
- **nom_pack** : ≥ 3 caractères
- **description** : ≥ 10 caractères  
- **produits_ids** : ≥ 1 élément
- **prix_mensuel** : > 0 et ≤ 10000 DT
- **duree_min** : 1-120 mois
- **duree_max** : > duree_min et ≤ 120 mois
- **niveau_couverture** : ∈ {BASIC, PREMIUM, GOLD}
- **actif** : booléen valide

#### Métier
- `duree_min < duree_max`
- `prix_mensuel > 0`
- `produits_ids.length ≤ 10`

---

## Avantages de l'Architecture

### Spécialisation
- Chaque chatbot a une responsabilité unique
- Code plus simple et maintenable
- Moins de risques de bugs croisés

### Maintenance Facilitée
- Modifications isolées par module
- Tests unitaires spécifiques
- Déploiement indépendant possible

### Performance
- Seules les fonctionnalités nécessaires sont chargées
- Mémoire optimisée
- Temps de réponse réduit

### Sécurité
- Séparation claire des rôles
- Droits d'accès différenciés
- Moins de surface d'attaque

---

## Configuration

### Variables d'Environnement
```bash
# Service de recommandation
RECOMMENDATION_SERVICE_URL=http://localhost:9095

# Service produit
PRODUCT_SERVICE_URL=http://localhost:9093
```

### Structure des Fichiers
```
ai-service/
├── chatbot/
│   ├── recommendation_chatbot.py    # Chatbot de recommandation
│   ├── chatbot_engine.py           # Chatbot d'administration
│   └── pack_chatbot.py           # Chatbot de création de packs
├── services/
│   ├── enhanced_recommendation_service.py
│   ├── google_api_service.py
│   └── hybrid_recommendation_engine.py
├── config/
│   └── api_config.py
├── tests/
│   └── __init__.py
├── docs/
│   └── AI_SERVICE_DOCUMENTATION.md
├── requirements.txt
├── .env
└── app.py
```

---

## Tests

### Exécuter les tests
```bash
cd ai-service
python tests/test_pack_chatbot.py
```

### Tests couverts
- ✅ Parsing intelligent
- ✅ Validation des règles
- ✅ Gestion des erreurs
- ✅ Flux de correction
- ✅ Cas limites
- ✅ Flux complet

---

## Déploiement

### Prérequis
- Python 3.8+
- Flask
- Services backend (GestionProduit, Recommendation)

### Installation
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

### Endpoints Actifs
```bash
POST /api/recommendation-chat/start    # Démarrer conversation recommandation
POST /api/recommendation-chat          # Continuer conversation recommandation
POST /api/admin-chat/start            # Démarrer conversation admin
POST /api/admin-chat                  # Continuer conversation admin
POST /api/pack-chat/start             # Démarrer création de pack
POST /api/pack-chat                   # Continuer création de pack
```

---

## Debug

### Logs activés
```python
# Dans la console, vous verrez :
DEBUG: État actuel: collecting
DEBUG: Message brut: '2000DT'
DEBUG: Parsing intelligent pour 'prix_mensuel' (type: float) depuis '2000DT'
DEBUG: Valeur validée et stockée: prix_mensuel = 2000.0
```

### États possibles
- `welcome` : Message de bienvenue
- `collecting` : Collecte des données
- `validation` : Validation des données
- `confirmation` : Confirmation finale
- `correction` : Correction d'un champ
- `completed` : Création terminée

---

## Évolutions Futures

### Possibles Améliorations
1. **Chatbot de Support** : Pour les questions fréquentes et l'aide utilisateur
2. **Chatbot de Souscription** : Pour finaliser les contrats après recommandation
3. **Chatbot de Suivi** : Pour le suivi des sinistres et réclamations

### Architecture Microservices
Chaque chatbot pourrait devenir un microservice indépendant :
- API REST dédiée
- Base de données propre
- Scalabilité horizontale
- Déploiement conteneurisé

---

## Conclusion

Cette architecture unifiée offre une base solide pour l'évolution du système de chatbots Vermeg. Elle combine simplicité, performance et évolutivité tout en maintenant la compatibilité avec les intégrations existantes.

La solution garantit une création de packs **fiable, intuitive et sans erreur** tout en offrant une expérience utilisateur optimale pour les recommandations et l'administration.
