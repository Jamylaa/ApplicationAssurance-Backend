# Diagrammes UML Complets - Projet Backend Vermeg

## Vue d'ensemble du Projet

Ce document présente l'ensemble des diagrammes UML pour le système de gestion d'assurance Vermeg, incluant les microservices Spring Boot, le service AI/Chatbot Python, et l'architecture globale.
---
## 1. Diagramme de Classes Global

```mermaid
classDiagram
    %% Entités Principales
    class User {
        <<abstract>>
        -String idUser
        -String userName
        -String email
        -String password
        -int phone
        -Role role
        -boolean actif
        -Date dateCreation
        +getIdUser()
        +setUserName()
        +getEmail()
        +setPassword()
        +getPhone()
        +getRole()
        +isActif()
        +getDateCreation()
    }

    class Client {
        -int age
        -boolean maladieChronique
        -boolean diabetique
        +getAge()
        +hasMaladieChronique()
        +isDiabetique()
    }

    class Admin {
        -String departement
        +getDepartement()
    }

    %% Entités Produit
    class Produit {
        -String idProduit
        -String nomProduit
        -String description
        -List~String~ garantiesIds
        -double prixBase
        -int ageMin
        -int ageMax
        -boolean maladieChroniqueAutorisee
        -boolean diabetiqueAutorise
        -boolean actif
        -Instant dateCreation
        +getIdProduit()
        +getNomProduit()
        +getDescription()
        +getGarantiesIds()
        +getPrixBase()
        +getAgeMin()
        +getAgeMax()
        +isMaladieChroniqueAutorisee()
        +isDiabetiqueAutorise()
        +isActif()
        +getDateCreation()
    }

    class Garantie {
        -String idGarantie
        -String nomGarantie
        -String description
        -TypeGarantie typeGarantie
        -double montantMax
        -boolean actif
        +getIdGarantie()
        +getNomGarantie()
        +getDescription()
        +getTypeGarantie()
        +getMontantMax()
        +isActif()
    }

    class Pack {
        -String idPack
        -String nomPack
        -String description
        -List~String~ produitsIds
        -double prixTotal
        -boolean actif
        +getIdPack()
        +getNomPack()
        +getDescription()
        +getProduitsIds()
        +getPrixTotal()
        +isActif()
    }

    %% Entités Souscription
    class Contrat {
        -String idContrat
        -String clientId
        -String clientNom
        -String clientEmail
        -int clientPhone
        -int clientAge
        -String clientSexe
        -String clientProfession
        -String clientSituationFamiliale
        -String produitId
        -String produitNom
        -String produitDescription
        -double produitPrixBase
        -List~String~ produitGarantiesIds
        -Date dateDebut
        -Date dateFin
        -int dureeMois
        -double primeTotale
        -String statut
        -Date dateCreation
        -String optionsSupplementaires
        +getIdContrat()
        +getClientId()
        +getClientNom()
        +getClientEmail()
        +getClientPhone()
        +getClientAge()
        +getClientSexe()
        +getClientProfession()
        +getClientSituationFamiliale()
        +getProduitId()
        +getProduitNom()
        +getProduitDescription()
        +getProduitPrixBase()
        +getProduitGarantiesIds()
        +getDateDebut()
        +getDateFin()
        +getDureeMois()
        +getPrimeTotale()
        +getStatut()
        +getDateCreation()
        +getOptionsSupplementaires()
    }

    %% Entités Recommendation
    class RecommendationProfile {
        -String clientId
        -int age
        -String sexe
        -String profession
        -String situationFamiliale
        -boolean maladieChronique
        -boolean diabetique
        -boolean tension
        -boolean maladiesLegeres
        -int nombreBeneficiaires
        -int dureeContratSouhaitee
        -double budgetMensuel
        -Date dateEvaluation
        +getClientId()
        +getAge()
        +getSexe()
        +getProfession()
        +getSituationFamiliale()
        +hasMaladieChronique()
        +isDiabetique()
        +hasTension()
        +hasMaladiesLegeres()
        +getNombreBeneficiaires()
        +getDureeContratSouhaitee()
        +getBudgetMensuel()
        +getDateEvaluation()
    }

    class ScoredPack {
        -String packId
        -String nomPack
        -int score
        -List~String~ raisons
        -double prixTotal
        -List~String~ produitsIds
        +getPackId()
        +getNomPack()
        +getScore()
        +getRaisons()
        +getPrixTotal()
        +getProduitsIds()
    }

    %% Chatbot Classes
    class BaseChatbot {
        <<abstract>>
        -List~Dict~ fields
        -String service_url
        -String entity_name
        -ChatState state
        -int current_field_index
        -Dict collected_data
        -List validation_errors
        -Dict correction_field
        -boolean has_api_error
        +process_message(message: str) Dict
        +reset_state()
        +get_welcome_message() Dict
        +_handle_welcome(message: str) Dict
        +_handle_collecting(message: str) Dict
        +_handle_validation(message: str) Dict
        +_handle_confirmation(message: str) Dict
        +_handle_correction(message: str) Dict
        +_perform_create() Dict
        +_smart_parse(message: str, field: Dict) Any
        +_parse_boolean(message: str) Optional~bool~
    }

    class RecommendationChatbot {
        -String recommendation_service_url
        -List RECOMMENDATION_FIELDS
        +process_message(message: str, history: list, client_id: str) dict
        +get_welcome_message() dict
        +_extract_collected_data(history: list) dict
        +_get_current_field(collected_data: dict) dict
        +_extract_value(message: str, field: dict) Any
        +_finalize_recommendation(collected_data: dict, client_id: str) dict
        +get_user_profile_summary(collected_data: dict) str
    }

    class ChatState {
        <<enumeration>>
        WELCOME
        COLLECTING
        VALIDATION
        CONFIRMATION
        CORRECTION
        COMPLETED
    }

    %% Enums
    class TypeGarantie {
        <<enumeration>>
        SANTE
        ACCIDENT
        VIE
        HABITATION
        VOITURE
    }

    class Role {
        <<enumeration>>
        CLIENT
        ADMIN
    }

    %% Relations
    User <|-- Client
    User <|-- Admin
    Client "1" -- "*" Contrat : possède
    Produit "1" -- "*" Contrat : couvre
    Produit "*" -- "*" Garantie : inclut
    Pack "*" -- "*" Produit : contient
    Garantie -- TypeGarantie : de type
    User -- Role : a le rôle
    RecommendationProfile "1" -- "*" ScoredPack : génère
    BaseChatbot <|-- RecommendationChatbot
    BaseChatbot -- ChatState : utilise
```

---

## 2. Diagramme de Cas d'Utilisation Complet

```mermaid
useCaseDiagram
    actor Client
    actor Admin
    actor System

    rectangle Gestion des Utilisateurs {
        Client --> (Créer un compte)
        Client --> (Se connecter)
        Client --> (Mettre à jour son profil)
        Admin --> (Gérer les comptes clients)
        Admin --> (Désactiver un compte)
    }

    rectangle Gestion des Produits {
        Admin --> (Créer un produit)
        Admin --> (Modifier un produit)
        Admin --> (Supprimer un produit)
        Admin --> (Lister les produits)
        Admin --> (Activer/Désactiver un produit)
        Client --> (Consulter les produits)
        Client --> (Rechercher des produits)
    }

    rectangle Gestion des Garanties {
        Admin --> (Créer une garantie)
        Admin --> (Modifier une garantie)
        Admin --> (Supprimer une garantie)
        Admin --> (Lister les garanties)
        Admin --> (Activer/Désactiver une garantie)
        Client --> (Consulter les garanties)
    }

    rectangle Gestion des Packs {
        Admin --> (Créer un pack)
        Admin --> (Modifier un pack)
        Admin --> (Supprimer un pack)
        Admin --> (Lister les packs)
        Client --> (Consulter les packs)
        Client --> (Comparer les packs)
    }

    rectangle Gestion des Contrats {
        Client --> (Souscrire un contrat)
        Client --> (Consulter ses contrats)
        Client --> (Renouveler un contrat)
        Client --> (Résilier un contrat)
        Admin --> (Lister tous les contrats)
        Admin --> (Désactiver un contrat)
        Admin --> (Valider une souscription)
    }

    rectangle Recommandation IA {
        Client --> (Obtenir des recommandations)
        Client --> (Discuter avec le chatbot)
        Admin --> (Tester les recommandations)
        Admin --> (Configurer les algorithmes)
        System --> (Analyser le profil client)
        System --> (Calculer les scores)
    }

    rectangle Chatbot Administration {
        Admin --> (Créer via chatbot)
        Admin --> (Modifier via chatbot)
        Admin --> (Supprimer via chatbot)
        Admin --> (Valider les entités)
    }

    rectangle Services Techniques {
        System --> (Découverte de services)
        System --> (Routage des requêtes)
        System --> (Gestion des erreurs)
        System --> (Monitoring)
    }
```

---

## 3. Diagramme de Séquence - Souscription Complète

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Gateway
    participant RecChatbot as RecommendationChatbot
    participant RecService as RecommendationService
    participant SouscriptionController
    participant SouscriptionService
    participant ContratRepository
    participant MongoDB
    participant ProduitService
    participant UserService

    Client->>Frontend: Accès page d'assurance
    Frontend->>RecChatbot: POST /api/recommendation-chat/start
    RecChatbot-->>Frontend: Message de bienvenue
    
    loop Conversation de recommandation
        Client->>Frontend: Réponse questionnaire
        Frontend->>RecChatbot: POST /api/recommendation-chat
        RecChatbot->>RecChatbot: _extract_value()
        RecChatbot-->>Frontend: Prochaine question / Recommandations
    end

    RecChatbot->>RecService: POST /api/recommendations/evaluate
    RecService-->>RecChatbot: Packs recommandés
    RecChatbot-->>Frontend: Packs avec scores
    Frontend-->>Client: Affichage des recommandations

    Client->>Frontend: Sélection d'un pack
    Frontend->>Gateway: POST /api/souscriptions/creer
    Gateway->>SouscriptionController: creerSouscription(request)
    
    SouscriptionController->>SouscriptionService: creerContrat(souscriptionRequest)
    
    SouscriptionService->>ProduitService: getProduit(idProduit)
    ProduitService-->>SouscriptionService: Produit
    
    SouscriptionService->>UserService: getClient(idClient)
    UserService-->>SouscriptionService: Client
    
    SouscriptionService->>SouscriptionService: validerÉligibilité()
    
    alt Éligible
        SouscriptionService->>ContratRepository: save(contrat)
        ContratRepository->>MongoDB: INSERT contrats
        MongoDB-->>ContratRepository: Contrat sauvegardé
        ContratRepository-->>SouscriptionService: Contrat
        SouscriptionService-->>SouscriptionController: Contrat créé
        SouscriptionController-->>Gateway: Confirmation
        Gateway-->>Frontend: Contrat créé
        Frontend-->>Client: Confirmation de souscription
    else Non éligible
        SouscriptionService-->>SouscriptionController: Erreur éligibilité
        SouscriptionController-->>Gateway: Message d'erreur
        Gateway-->>Frontend: Erreur
        Frontend-->>Client: Message d'erreur
    end
```

---

## 4. Diagramme de Séquence - Création via Chatbot Admin

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Gateway
    participant AdminChatbot as ChatbotEngine
    participant ProduitService
    participant ProduitRepository
    participant MongoDB

    Admin->>Frontend: Accès chat admin
    Frontend->>Gateway: POST /api/admin-chat/start
    Gateway->>AdminChatbot: get_welcome_message()
    AdminChatbot-->>Frontend: "Bonjour ! Que souhaitez-vous créer ?"
    Frontend-->>Admin: Affichage du chat

    Admin->>Frontend: "Je veux créer un produit"
    Frontend->>Gateway: POST /api/admin-chat
    Gateway->>AdminChatbot: process_message("Je veux créer un produit")
    AdminChatbot->>AdminChatbot: _handle_welcome()
    AdminChatbot-->>Gateway: "Quel est le nom du produit ?"
    Gateway-->>Frontend: Question
    Frontend-->>Admin: Affichage de la question

    loop Collecte des informations
        Admin->>Frontend: Réponse
        Frontend->>Gateway: POST /api/admin-chat
        Gateway->>AdminChatbot: process_message(réponse)
        AdminChatbot->>AdminChatbot: _handle_collecting()
        AdminChatbot->>AdminChatbot: _smart_parse()
        
        alt Validation réussie
            AdminChatbot-->>Gateway: Prochaine question
            Gateway-->>Frontend: Question
            Frontend-->>Admin: Affichage
        else Erreur de validation
            AdminChatbot-->>Gateway: Message d'erreur
            Gateway-->>Frontend: Erreur
            Frontend-->>Admin: Affichage erreur
        end
    end

    AdminChatbot->>AdminChatbot: _move_to_confirmation()
    AdminChatbot-->>Gateway: Récapitulatif + confirmation
    Gateway-->>Frontend: Récapitulatif
    Frontend-->>Admin: Affichage récapitulatif

    Admin->>Frontend: "Oui"
    Frontend->>Gateway: POST /api/admin-chat
    Gateway->>AdminChatbot: process_message("Oui")
    AdminChatbot->>AdminChatbot: _perform_create()
    AdminChatbot->>ProduitService: POST /api/produits
    ProduitService->>ProduitRepository: save(produit)
    ProduitRepository->>MongoDB: INSERT produits
    MongoDB-->>ProduitRepository: Produit sauvegardé
    ProduitRepository-->>ProduitService: Produit
    ProduitService-->>AdminChatbot: Produit créé
    AdminChatbot-->>Gateway: "✅ Produit créé avec succès !"
    Gateway-->>Frontend: Confirmation
    Frontend-->>Admin: Affichage confirmation
```

---

## 5. Architecture Microservices Complète

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Angular Application]
        A1[Client Components]
        A2[Admin Components]
        A3[Chatbot Components]
        A --> A1
        A --> A2
        A --> A3
    end
    
    subgraph "API Gateway Layer"
        B[Spring Cloud Gateway]
        B1[Authentication Filter]
        B2[Routing Filter]
        B3[CORS Filter]
        B4[Rate Limiting]
        B --> B1
        B --> B2
        B --> B3
        B --> B4
    end
    
    subgraph "Service Discovery"
        C[Eureka Server]
        C1[Service Registry]
        C --> C1
    end
    
    subgraph "Business Services"
        D[GestionUser Service<br/>Port: 8081]
        D1[User Controller]
        D2[User Service]
        D3[User Repository]
        D --> D1
        D --> D2
        D --> D3
        
        E[GestionProduit Service<br/>Port: 8083]
        E1[Produit Controller]
        E2[Garantie Controller]
        E3[Pack Controller]
        E4[Produit Service]
        E5[Garantie Service]
        E6[Pack Service]
        E7[Produit Repository]
        E8[Garantie Repository]
        E9[Pack Repository]
        E --> E1
        E --> E2
        E --> E3
        E --> E4
        E --> E5
        E --> E6
        E --> E7
        E --> E8
        E --> E9
        
        F[GestionSouscription Service<br/>Port: 8084]
        F1[Souscription Controller]
        F2[Contrat Controller]
        F3[Souscription Service]
        F4[Contrat Service]
        F5[Feign Clients]
        F6[Contrat Repository]
        F --> F1
        F --> F2
        F --> F3
        F --> F4
        F --> F5
        F --> F6
        
        G[Recommendation Service<br/>Port: 9095]
        G1[Recommendation Controller]
        G2[Scoring Engine]
        G3[ML Models]
        G4[Profile Repository]
        G --> G1
        G --> G2
        G --> G3
        G --> G4
    end
    
    subgraph "AI Services"
        H[AI Service<br/>Port: 5000]
        H1[Flask Server]
        H2[Chatbot Engine]
        H3[Recommendation Chatbot]
        H4[Base Chatbot]
        H5[Session Manager]
        H --> H1
        H --> H2
        H --> H3
        H --> H4
        H --> H5
    end
    
    subgraph "Data Layer"
        I[(MongoDB - Users<br/>Database: user_db)]
        J[(MongoDB - Products<br/>Database: product_db)]
        K[(MongoDB - Contracts<br/>Database: contract_db)]
        L[(MongoDB - Recommendations<br/>Database: recommendation_db)]
        M[(ML Models<br/>File System)]
    end
    
    subgraph "External Services"
        N[Email Service]
        O[Payment Service]
        P[Notification Service]
    end
    
    %% Connections
    A --> B
    B --> D
    B --> E
    B --> F
    B --> G
    B --> H
    
    D --> C
    E --> C
    F --> C
    G --> C
    H --> C
    
    D --> I
    E --> J
    F --> K
    G --> L
    G --> M
    
    F --> N
    F --> O
    F --> P
    
    H --> G
    H --> E
    H --> D
```

---

## 6. Diagramme de Séquence - Communication Inter-Services

```mermaid
sequenceDiagram
    participant Gateway
    participant SouscriptionService
    participant UserService
    participant ProduitService
    participant RecommendationService
    participant AIService
    participant MongoDB_User
    participant MongoDB_Product
    participant MongoDB_Contract

    Gateway->>SouscriptionService: POST /api/souscriptions/creer
    
    SouscriptionService->>UserService: Feign: getUser(idClient)
    UserService->>MongoDB_User: SELECT users WHERE id = ?
    MongoDB_User-->>UserService: User
    UserService-->>SouscriptionService: Client DTO
    
    SouscriptionService->>ProduitService: Feign: getProduit(idProduit)
    ProduitService->>MongoDB_Product: SELECT produits WHERE id = ?
    MongoDB_Product-->>ProduitService: Produit
    ProduitService-->>SouscriptionService: Produit DTO
    
    SouscriptionService->>RecommendationService: Feign: validateEligibility(clientId, produitId)
    RecommendationService->>RecommendationService: calculateEligibilityScore()
    RecommendationService-->>SouscriptionService: EligibilityResult
    
    SouscriptionService->>SouscriptionService: createContratEntity()
    
    SouscriptionService->>MongoDB_Contract: INSERT contrats
    MongoDB_Contract-->>SouscriptionService: Contrat sauvegardé
    
    SouscriptionService->>AIService: POST /api/recommendation-chat/profile
    AIService->>AIService: updateProfileData()
    AIService-->>SouscriptionService: Profile updated
    
    SouscriptionService-->>Gateway: Contrat créé
    Gateway-->>Client: Response
```

---

## 7. Diagramme de Composants Techniques

```mermaid
graph TB
    subgraph "Frontend Technology Stack"
        FA[Angular 15+]
        FB[TypeScript]
        FC[Angular Material]
        FD[RxJS]
        FE[HttpClient]
    end
    
    subgraph "Backend Technology Stack"
        BA[Spring Boot 3.x]
        BB[Spring Cloud]
        BC[Spring Data MongoDB]
        BD[Spring Security]
        BE[Spring WebFlux]
    end
    
    subgraph "AI/ML Technology Stack"
        AA[Python 3.9+]
        AB[Flask]
        AC[Scikit-learn]
        AD[NLTK/Spacy]
        AE[Pandas/NumPy]
        AF[Joblib]
    end
    
    subgraph "Infrastructure"
        IA[MongoDB Cluster]
        IB[Docker Containers]
        IC[NGINX Reverse Proxy]
        ID[Redis Cache]
        IE[Prometheus Monitoring]
        IF[ELK Stack]
    end
    
    subgraph "Development Tools"
        DA[Maven]
        DB[pip]
        DC[Git]
        DD[JUnit/pytest]
        DE[Postman]
        DF[Swagger/OpenAPI]
    end
    
    FA --> BA
    FB --> BA
    FC --> BA
    FD --> BA
    FE --> BA
    
    BA --> IA
    BB --> IA
    BC --> IA
    BD --> IA
    BE --> IA
    
    AA --> IA
    AB --> IA
    AC --> IA
    AD --> IA
    AE --> IA
    AF --> IA
    
    BA --> IB
    AA --> IB
    IA --> IB
    
    BA --> IC
    AA --> IC
    
    BA --> ID
    BB --> ID
    AA --> ID
    
    BA --> IE
    BB --> IE
    AA --> IE
    
    BA --> IF
    BB --> IF
    AA --> IF
```

---

## 8. Diagramme de Déploiement

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Load Balancer"
            LB[NGINX/HAProxy]
        end
        
        subgraph "Frontend Servers"
            FE1[Angular App 1]
            FE2[Angular App 2]
        end
        
        subgraph "API Gateway Cluster"
            GW1[Gateway 1]
            GW2[Gateway 2]
        end
        
        subgraph "Microservices Cluster"
            MS1[User Service Instance 1]
            MS2[User Service Instance 2]
            MS3[Product Service Instance 1]
            MS4[Product Service Instance 2]
            MS5[Subscription Service Instance 1]
            MS6[Subscription Service Instance 2]
            MS7[Recommendation Service Instance 1]
            MS8[AI Service Instance 1]
            MS9[AI Service Instance 2]
        end
        
        subgraph "Service Discovery"
            EUREKA[Eureka Server Cluster]
        end
        
        subgraph "Database Cluster"
            DB1[MongoDB Primary]
            DB2[MongoDB Secondary 1]
            DB3[MongoDB Secondary 2]
        end
        
        subgraph "Monitoring & Logging"
            PROM[Prometheus]
            GRAF[Grafana]
            ELK[ELK Stack]
        end
    end
    
    LB --> FE1
    LB --> FE2
    LB --> GW1
    LB --> GW2
    
    FE1 --> GW1
    FE2 --> GW2
    
    GW1 --> MS1
    GW1 --> MS2
    GW1 --> MS3
    GW1 --> MS4
    GW1 --> MS5
    GW1 --> MS6
    GW1 --> MS7
    GW1 --> MS8
    GW1 --> MS9
    
    GW2 --> MS1
    GW2 --> MS2
    GW2 --> MS3
    GW2 --> MS4
    GW2 --> MS5
    GW2 --> MS6
    GW2 --> MS7
    GW2 --> MS8
    GW2 --> MS9
    
    MS1 --> EUREKA
    MS2 --> EUREKA
    MS3 --> EUREKA
    MS4 --> EUREKA
    MS5 --> EUREKA
    MS6 --> EUREKA
    MS7 --> EUREKA
    MS8 --> EUREKA
    MS9 --> EUREKA
    
    MS1 --> DB1
    MS2 --> DB1
    MS3 --> DB1
    MS4 --> DB1
    MS5 --> DB1
    MS6 --> DB1
    MS7 --> DB1
    MS8 --> DB1
    MS9 --> DB1
    
    DB1 --> DB2
    DB1 --> DB3
    
    MS1 --> PROM
    MS2 --> PROM
    MS3 --> PROM
    MS4 --> PROM
    MS5 --> PROM
    MS6 --> PROM
    MS7 --> PROM
    MS8 --> PROM
    MS9 --> PROM
    
    PROM --> GRAF
    
    MS1 --> ELK
    MS2 --> ELK
    MS3 --> ELK
    MS4 --> ELK
    MS5 --> ELK
    MS6 --> ELK
    MS7 --> ELK
    MS8 --> ELK
    MS9 --> ELK
```

---

## 9. Description des Composants et Patterns

### Entités Principales
- **User**: Classe abstraite représentant les utilisateurs du système avec authentification
- **Client**: Extension de User pour les clients finaux avec profil médical
- **Admin**: Extension de User pour l'administration du système
- **Produit**: Produits d'assurance avec règles d'éligibilité
- **Garantie**: Couvertures individuelles regroupées en produits
- **Pack**: Combinaison de produits avec tarification préférentielle
- **Contrat**: Engagement contractuel avec snapshot des données

### Services Métier
- **GestionUser**: Gestion des comptes et profils utilisateurs
- **GestionProduit**: Catalogue des produits, garanties et packs
- **GestionSouscription**: Cycle de vie des contrats
- **Recommendation**: Moteur de recommandation IA
- **AI Service**: Chatbots et traitement NLP

### Patterns Architecturaux
- **Microservices**: Décomposition par domaine métier
- **API Gateway**: Point d'entrée unique et routage
- **Service Discovery**: Enregistrement automatique des services
- **CQRS**: Séparation lecture/écriture pour les performances
- **Event Sourcing**: Traçabilité des changements d'état
- **Circuit Breaker**: Résilience des appels inter-services

### Flux Principaux
1. **Onboarding Client**: Création compte → Questionnaire IA → Recommandations → Souscription
2. **Administration**: Chatbot de création → Validation → Publication
3. **Gestion Contrat**: Souscription → Suivi → Renouvellement → Résiliation
4. **Recommandation**: Analyse profil → Calcul scores → Suggestion packs

---

## 10. Règles Métier et Contraintes

### Éligibilité
- Âge compris entre ageMin et ageMax du produit
- Conditions médicales respectées (maladie chronique, diabète)
- Cohérence des informations profil

### Tarification
- Prix base des produits modifiable par admin
- Calcul automatique des prix des packs
- Prime basée sur profil et durée

### Sécurité
- Authentification JWT obligatoire
- Rôles différenciés (CLIENT/ADMIN)
- HTTPS obligatoire en production
- Rate limiting sur les endpoints sensibles

### Performance
- Réponse < 2s pour les requêtes standards
- Chatbot réponse < 1s
- Cache Redis pour les données fréquemment accédées
- Monitoring temps réel

---

Ce document fournit une vue complète de l'architecture du projet backend Vermeg, incluant tous les diagrammes UML nécessaires pour comprendre le système, ses interactions et son déploiement.
