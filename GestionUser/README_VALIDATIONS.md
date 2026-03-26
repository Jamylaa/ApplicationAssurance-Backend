# Améliorations des Contrôles de Saisie - GestionUser Service

## 📋 Vue d'ensemble

Ce document présente les améliorations apportées aux contrôles de saisie pour le service de gestion des utilisateurs, avec des validations robustes pour le username et le mot de passe.

## 🔧 Nouveaux Fichiers Créés

### 1. UserValidator.java
**Emplacement** : `tn.vermeg.gestionuser.validation.UserValidator`

**Fonctionnalités** :
- Validation du format username (un seul mot ou mots séparés par tirets)
- Validation de la longueur minimale du mot de passe (6 caractères)
- Validation de l'email et du téléphone
- Messages d'erreur clairs et spécifiques

**Règles de validation** :
```java
// Username: format "jean" ou "jean-marc" (pas d'espaces)
Pattern: ^[a-zA-Z]+(-[a-zA-Z]+)*$

// Mot de passe: minimum 6 caractères, au moins 1 lettre et 1 chiffre
Pattern: ^(?=.*[a-zA-Z])(?=.*[0-9]).+$
```

### 2. ClientServiceImproved.java
**Emplacement** : `tn.vermeg.gestionuser.services.ClientServiceImproved`

**Améliorations** :
- Intégration des validations dans les méthodes `createClient()` et `updateClient()`
- Vérification de l'unicité des emails et usernames
- Messages d'erreur détaillés
- Séparation claire entre validation et logique métier

### 3. ClientDTO.java
**Emplacement** : `tn.vermeg.gestionuser.dto.ClientDTO`

**Annotations de validation** :
```java
@Pattern(regexp = "^[a-zA-Z]+(-[a-zA-Z]+)*$", 
         message = "Le username doit être un seul mot ou des mots séparés uniquement par des tirets")
@Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
@Email(message = "L'email doit avoir un format valide")
```

### 4. ClientMapper.java
**Emplacement** : `tn.vermeg.gestionuser.mapper.ClientMapper`

**Fonctionnalités** :
- Conversion entre DTO et Entity
- Mise à jour sélective des champs
- Protection des données sensibles

### 5. ClientControllerFinal.java
**Emplacement** : `tn.vermeg.gestionuser.controllers.ClientControllerFinal`

**Endpoints** :
- `GET /api/clients-v2` - Liste des clients (DTO)
- `POST /api/clients-v2` - Création avec validation
- `PUT /api/clients-v2/{id}` - Mise à jour avec validation
- `POST /api/clients-v2/validate-username` - Validation username
- `POST /api/clients-v2/validate-password` - Validation mot de passe

## 🎯 Règles de Validation Détaillées

### Username
- ✅ **Valide** : `jean`, `jean-marc`, `marie-claire`, `john`
- ❌ **Invalide** : `jean marc`, `jean_marc`, `jean marc dupont`, `jean--marc`

### Mot de passe
- ✅ **Valide** : `password123`, `azerty1`, `pass123`, `secret1`
- ❌ **Invalide** : `123`, `pass`, `password`, `motdepasse` (sans chiffre)

### Email
- ✅ **Valide** : `user@example.com`, `test.email@domain.fr`
- ❌ **Invalide** : `user@`, `@domain.com`, `user.domain.com`

### Téléphone
- ✅ **Valide** : `21234567`, `98765432` (8 chiffres, commence par 2-9)
- ❌ **Invalide** : `12345678`, `2123456`, `212345678`

## 🚀 Utilisation

### Exemple de création de client valide

```json
POST /api/clients-v2
{
    "userName": "jean-marc",
    "email": "jean.marc@example.com",
    "password": "pass123",
    "phone": 21234567,
    "age": 35,
    "sexe": "M",
    "profession": "Ingénieur",
    "situationFamiliale": "Marié",
    "maladieChronique": false,
    "diabetique": false,
    "tension": false,
    "nombreBeneficiaires": 4
}
```

### Exemple de réponse d'erreur

```json
{
    "timestamp": "2024-01-01T12:00:00.000+00:00",
    "status": 400,
    "error": "Bad Request",
    "message": "Username invalide: Le username doit être un seul mot ou des mots séparés uniquement par des tirets (ex: jean, jean-marc)"
}
```

## 🔍 Validation en temps réel

### Validation du username

```bash
curl -X POST "http://localhost:9091/api/clients-v2/validate-username?username=jean-marc"
# Réponse: "Username valide"

curl -X POST "http://localhost:9091/api/clients-v2/validate-username?username=jean marc"
# Réponse: "Le username doit être un seul mot ou des mots séparés uniquement par des tirets"
```

### Validation du mot de passe

```bash
curl -X POST "http://localhost:9091/api/clients-v2/validate-password?password=pass123"
# Réponse: "Mot de passe valide"

curl -X POST "http://localhost:9091/api/clients-v2/validate-password?password=123"
# Réponse: "Le mot de passe doit contenir au moins 6 caractères"
```

## 🛡️ Sécurité

### Protection des données
- Les mots de passe ne sont jamais renvoyés dans les réponses API
- Validation côté serveur obligatoire
- Protection contre les injections SQL via MongoDB
- Vérification de l'unicité des emails et usernames

### Messages d'erreur
- Messages clairs pour guider l'utilisateur
- Pas de divulgation d'informations système
- Format standardisé des erreurs

## 🔄 Migration

Pour utiliser les nouvelles validations :

1. **Remplacer le service existant** :
   ```java
   // Ancien
   @Autowired
   private ClientService clientService;
   
   // Nouveau
   @Autowired
   private ClientServiceImproved clientService;
   ```

2. **Utiliser le DTO dans les contrôleurs** :
   ```java
   public ResponseEntity<?> createClient(@Valid @RequestBody ClientDTO clientDTO)
   ```

3. **Mettre à jour les endpoints** :
   - Ancien : `/api/clients`
   - Nouveau : `/api/clients-v2`

## 📊 Tests Unitaires

Exemples de tests à implémenter :

```java
@Test
void testValidUsername() {
    String result = UserValidator.validateUsername("jean-marc");
    assertNull(result);
}

@Test
void testInvalidUsername() {
    String result = UserValidator.validateUsername("jean marc");
    assertNotNull(result);
    assertEquals("Le username doit être un seul mot ou des mots séparés uniquement par des tirets", result);
}

@Test
void testValidPassword() {
    String result = UserValidator.validatePassword("pass123");
    assertNull(result);
}

@Test
void testInvalidPassword() {
    String result = UserValidator.validatePassword("123");
    assertNotNull(result);
    assertEquals("Le mot de passe doit contenir au moins 6 caractères", result);
}
```

## 🎯 Avantages

1. **Expérience utilisateur améliorée** : Messages d'erreur clairs
2. **Sécurité renforcée** : Validation robuste côté serveur
3. **Maintenabilité** : Code séparé et réutilisable
4. **Flexibilité** : Validation en temps réel possible
5. **Conformité** : Respect des standards de sécurité

Ces améliorations garantissent que les données saisies par les utilisateurs respectent les règles métier tout en offrant une expérience utilisateur optimale.
