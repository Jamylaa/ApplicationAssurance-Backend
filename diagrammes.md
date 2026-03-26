# Diagrammes UML - Système de Gestion d'Assurance

## 1. Diagramme de Classes

```mermaid
classDiagram
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
        -Date dateCreation
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

    class Contrat {
        -String idContrat
        -String idClient
        -String idProduit
        -Date dateDebut
        -Date dateFin
        -double prime
        -boolean actif
        +getIdContrat()
        +getIdClient()
        +getIdProduit()
        +getDateDebut()
        +getDateFin()
        +getPrime()
        +isActif()
    }

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

    User <|-- Client
    User <|-- Admin
    Client "1" -- "*" Contrat : possède
    Produit "1" -- "*" Contrat : couvre
    Produit "*" -- "*" Garantie : inclut
    Pack "*" -- "*" Produit : contient
    Garantie -- TypeGarantie : de type
    User -- Role : a le rôle
```

## 2. Diagramme de Cas d'Utilisation

```mermaid
useCaseDiagram
    actor Client
    actor Admin

    rectangle Gestion des Produits {
        Admin --> (Créer un produit)
        Admin --> (Modifier un produit)
        Admin --> (Supprimer un produit)
        Admin --> (Lister les produits)
        Admin --> (Activer/Désactiver un produit)
    }

    rectangle Gestion des Garanties {
        Admin --> (Créer une garantie)
        Admin --> (Modifier une garantie)
        Admin --> (Supprimer une garantie)
        Admin --> (Lister les garanties)
        Admin --> (Activer/Désactiver une garantie)
    }

    rectangle Gestion des Packs {
        Admin --> (Créer un pack)
        Admin --> (Modifier un pack)
        Admin --> (Supprimer un pack)
        Admin --> (Lister les packs)
    }

    rectangle Gestion des Contrats {
        Client --> (Souscrire un contrat)
        Client --> (Consulter ses contrats)
        Client --> (Renouveler un contrat)
        Client --> (Résilier un contrat)
        Admin --> (Lister tous les contrats)
        Admin --> (Désactiver un contrat)
    }

    rectangle Gestion Compte {
        Client --> (Créer un compte)
        Client --> (Se connecter)
        Client --> (Mettre à jour son profil)
        Admin --> (Gérer les comptes clients)
    }

    rectangle Consultation {
        Client --> (Consulter les produits)
        Client --> (Consulter les garanties)
        Client --> (Consulter les packs)
        Client --> (Rechercher des produits)
    }
```

## 3. Diagramme de Séquence - Création de Contrat

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Gateway
    participant ContratController
    participant ContratService
    participant ContratRepository
    participant MongoDB
    participant ProduitService
    participant UserService

    Client->>Frontend: Demande de souscription
    Frontend->>Gateway: POST /api/contrats/creer
    Gateway->>ContratController: creerContrat(contrat)
    
    ContratController->>ContratService: creerContrat(contrat)
    
    ContratService->>ProduitService: getProduit(idProduit)
    ProduitService-->>ContratService: Produit
    
    ContratService->>UserService: getClient(idClient)
    UserService-->>ContratService: Client
    
    ContratService->>ContratService: validerÉligibilité()
    
    alt Éligible
        ContratService->>ContratRepository: save(contrat)
        ContratRepository->>MongoDB: INSERT contrats
        MongoDB-->>ContratRepository: Contrat sauvegardé
        ContratRepository-->>ContratService: Contrat
        ContratService-->>ContratController: Contrat créé
        ContratController-->>Gateway: Contrat
        Gateway-->>Frontend: Contrat créé
        Frontend-->>Client: Confirmation de souscription
    else Non éligible
        ContratService-->>ContratController: Erreur éligibilité
        ContratController-->>Gateway: Message d'erreur
        Gateway-->>Frontend: Erreur
        Frontend-->>Client: Message d'erreur
    end
```

## 4. Diagramme de Séquence - Renouvellement de Contrat

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Gateway
    participant ContratController
    participant ContratService
    participant ContratRepository
    participant MongoDB

    Client->>Frontend: Demande de renouvellement
    Frontend->>Gateway: POST /api/contrats/renouveler/{id}
    Gateway->>ContratController: renouvelerContrat(id, duree)
    
    ContratController->>ContratService: renouvelerContrat(id, duree)
    
    ContratService->>ContratRepository: findById(idContrat)
    ContratRepository->>MongoDB: SELECT contrats WHERE id = ?
    MongoDB-->>ContratRepository: Contrat
    ContratRepository-->>ContratService: Optional~Contrat~
    
    alt Contrat trouvé
        ContratService->>ContratService: calculerNouvelleDateFin()
        ContratService->>ContratRepository: save(contrat)
        ContratRepository->>MongoDB: UPDATE contrats
        MongoDB-->>ContratRepository: Contrat mis à jour
        ContratRepository-->>ContratService: Contrat renouvelé
        ContratService-->>ContratController: Contrat
        ContratController-->>Gateway: Contrat renouvelé
        Gateway-->>Frontend: Succès
        Frontend-->>Client: Confirmation de renouvellement
    else Contrat non trouvé
        ContratService-->>ContratController: null
        ContratController-->>Gateway: Erreur
        Gateway-->>Frontend: Contrat non trouvé
        Frontend-->>Client: Message d'erreur
    end
```

## 5. Diagramme de Séquence - Consultation des Produits

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Gateway
    participant ProduitController
    participant ProduitService
    participant ProduitRepository
    participant MongoDB

    Client->>Frontend: Recherche de produits
    Frontend->>Gateway: GET /api/produits
    Gateway->>ProduitController: getAllProduits()
    
    ProduitController->>ProduitService: getAllProduits()
    
    ProduitService->>ProduitRepository: findAll()
    ProduitRepository->>MongoDB: SELECT produits WHERE actif = true
    MongoDB-->>ProduitRepository: List~Produit~
    ProduitRepository-->>ProduitService: List~Produit~
    
    ProduitService->>ProduitService: filtrerProduitsÉligibles()
    ProduitService-->>ProduitController: List~Produit~
    ProduitController-->>Gateway: List~Produit~
    Gateway-->>Frontend: Produits disponibles
    Frontend-->>Client: Affichage des produits
```

## 6. Architecture Microservices

```mermaid
graph TB
    subgraph "Frontend"
        A[Angular Application]
    end
    
    subgraph "API Gateway"
        B[Spring Cloud Gateway]
    end
    
    subgraph "Service Discovery"
        C[Eureka Server]
    end
    
    subgraph "Microservices"
        D[GestionUser Service]
        E[GestionProduit Service]
        F[GestionSouscription Service]
        G[Recommendation Service]
        H[AI Service]
    end
    
    subgraph "Base de données"
        I[(MongoDB - Users)]
        J[(MongoDB - Produits)]
        K[(MongoDB - Contrats)]
        L[(MongoDB - Recommendations)]
    end
    
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
    H --> L
```

## Description des Composants

### Entités Principales
- **User**: Classe abstraite représentant les utilisateurs du système
- **Client**: Hérite de User, représente les clients qui souscrivent aux contrats
- **Admin**: Hérite de User, gère l'administration du système
- **Produit**: Représente les produits d'assurance disponibles
- **Garantie**: Définit les couvertures proposées
- **Pack**: Combinaison de plusieurs produits
- **Contrat**: Lie un client à un produit d'assurance

### Flux Principaux
1. **Souscription**: Client consulte les produits → choisit un produit → souscrit un contrat
2. **Gestion**: Admin gère les produits, garanties et packs
3. **Renouvellement**: Client peut renouveler ses contrats existants
4. **Recommandation**: Système suggère des produits basés sur le profil client

### Règles Métier
- Un client doit être éligible (âge, conditions médicales) pour souscrire
- Un contrat a une date de début et de fin
- Les produits peuvent être activés/désactivés par l'admin
- Les garanties sont classées par type (Santé, Accident, Vie, etc.)
