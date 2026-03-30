# Architecture GestionUser - Version Nettoyée

## 📋 Vue d'ensemble

L'architecture de GestionUser a été complètement restructurée pour éliminer les redondances et améliorer la maintenabilité.

## 🏗️ Structure Actuelle

### Controllers
- **`ClientController`** - Contrôleur unique et principal pour la gestion des clients
  - Endpoint: `/api/clients`
  - Documentation Swagger intégrée
  - Validation des entrées avec Jakarta Validation
  - Gestion cohérente des erreurs

### Services
- **`ClientService`** - Service unifié pour la logique métier
  - Validation complète des données
  - Hashage sécurisé des mots de passe
  - Envoi d'emails automatiques
  - Gestion des doublons

### DTOs
- **`ClientDTO`** - DTO pour la réception des données (avec validation)
- **`ClientResponseDTO`** - DTO pour la réponse (sans mot de passe)
- **`ValidationResult`** - DTO pour les résultats de validation

### Repositories
- **`ClientRepository`** - Repository unique avec toutes les requêtes nécessaires
  - Recherche par username
  - Recherche par email
  - Recherche textuelle (username ou email)

### Mappers
- **`ClientMapper`** - Mapper unifié avec toutes les conversions
  - Entity → DTO
  - DTO → Entity
  - Entity → ResponseDTO
  - Mise à jour partielle

### Sécurité
- **`PasswordService`** - Service pour le hashage et la vérification des mots de passe
  - Utilisation de BCrypt
  - Génération de mots de passe temporaires

### Validation
- **`UserValidator`** - Validateur centralisé pour les données utilisateur
  - Validation du username, email, téléphone, mot de passe

## 🔐 Améliorations de Sécurité

1. **Hashage des mots de passe**: Tous les mots de passe sont hashés avec BCrypt
2. **Masquage des mots de passe**: Les mots de passe ne sont jamais inclus dans les réponses API
3. **Validation renforcée**: Validation complète des données en entrée
4. **Emails sécurisés**: Les mots de passe ne sont jamais envoyés par email

## 📚 Documentation API

### Endpoints disponibles

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| GET | `/api/clients` | Récupérer tous les clients | Requise |
| GET | `/api/clients/{idUser}` | Récupérer un client par ID | Requise |
| POST | `/api/clients` | Créer un nouveau client | Non requise |
| PUT | `/api/clients/{idUser}` | Mettre à jour un client | Requise |
| DELETE | `/api/clients/{idUser}` | Supprimer un client | Requise |
| POST | `/api/clients/validate-username` | Valider un username | Non requise |
| POST | `/api/clients/validate-email` | Valider un email | Non requise |
| GET | `/api/clients/search?query={text}` | Rechercher des clients | Requise |

### Corps des requêtes

#### Création/Mise à jour de client (ClientDTO)
```json
{
  "userName": "jean-marc",
  "email": "jean.marc@example.com",
  "password": "password123",
  "phone": 55123456,
  "age": 35,
  "sexe": "M",
  "profession": "Ingénieur",
  "situationFamiliale": "Marié",
  "maladieChronique": false,
  "diabetique": false,
  "tension": false,
  "nombreBeneficiaires": 3
}
```

#### Réponse client (ClientResponseDTO)
```json
{
  "idUser": "507f1f77bcf86cd799439011",
  "userName": "jean-marc",
  "email": "jean.marc@example.com",
  "phone": 55123456,
  "age": 35,
  "sexe": "M",
  "profession": "Ingénieur",
  "situationFamiliale": "Marié",
  "maladieChronique": false,
  "diabetique": false,
  "tension": false,
  "nombreBeneficiaires": 3,
  "role": "CLIENT",
  "actif": true
}
```

## 🔄 Flux de travail

1. **Création d'un client**:
   - Validation des données via `UserValidator`
   - Vérification des doublons
   - Hashage du mot de passe
   - Sauvegarde en base
   - Envoi d'email de bienvenue

2. **Mise à jour d'un client**:
   - Validation des données
   - Vérification des doublons (en excluant le client actuel)
   - Hashage du nouveau mot de passe si fourni
   - Sauvegarde en base
   - Envoi d'email de notification

3. **Suppression d'un client**:
   - Vérification de l'existence
   - Suppression en base
   - Envoi d'email de confirmation

##  Avantages de la nouvelle architecture

1. **Unicité**: Plus de duplication de code
2. **Sécurité**: Protection complète des mots de passe
3. **Maintenabilité**: Structure claire et modulaire
4. **Documentation**: API auto-documentée avec Swagger
5. **Validation**: Validation robuste des données
6. **Performance**: Requêtes optimisées
7. **Extensibilité**: Facile à étendre

##  Notes importantes

- Le mot de passe n'est jamais retourné dans les réponses API
- Tous les emails sont envoyés automatiquement lors des opérations CRUD
- La validation est effectuée à plusieurs niveaux (DTO, Service)
- Les erreurs sont gérées de manière cohérente
- L'architecture respecte les principes SOLID

## 🔧 Dépendances requises

- Spring Boot Web
- Spring Data MongoDB
- Spring Security (pour BCrypt)
- Spring Boot Mail
- Jakarta Validation
- Swagger/OpenAPI 3

## 📝 Prochaines améliorations possibles

1. **Authentification JWT**: Implémenter un système d'authentification robuste
2. **Logging**: Ajouter un système de logging complet
3. **Tests unitaires**: Couvrir tous les services et contrôleurs
4. **Configuration externalisée**: Variables d'environnement pour les emails
5. **Rate limiting**: Limiter les requêtes API
6. **Audit trail**: Suivre les modifications des données
