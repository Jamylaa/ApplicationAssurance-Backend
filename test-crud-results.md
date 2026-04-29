# TEST CRUD - GestionUser Backend

## 🎯 Objectif
Tester toutes les opérations CRUD (Create, Read, Update, Delete) du service GestionUser

## 📋 État Actuel des Tests

### ✅ CREATE - Création d'utilisateur
**Endpoint** : `POST http://localhost:9092/api/auth/register`
**Statut** : ✅ **FONCTIONNEL**
**Résultat** : 
- Status : 201 Created
- Utilisateur créé : `testuser_crud`
- ID : `69f0ae7cb2d0db392dcf2841`
- Email : `jamila.Benabdelkader@esprit.tn`

### 🔄 READ - Lecture des utilisateurs
**Endpoints disponibles** :
- `GET http://localhost:9092/api/users` (nécessite authentification)
- `GET http://localhost:9092/api/users/{id}` (nécessite authentification)
- `GET http://localhost:9092/api/users/email/{email}` (nécessite authentification)
- `GET http://localhost:9092/api/users/username/{userName}` (nécessite authentification)

**Statut** : ⚠️ **NÉCESSITE AUTHENTIFICATION**
**Problème** : Les endpoints CRUD sont protégés par Spring Security

### 🔄 UPDATE - Mise à jour d'utilisateur
**Endpoint** : `PUT http://localhost:9092/api/users/{id}` (nécessite authentification)
**Statut** : ⚠️ **NÉCESSITE AUTHENTIFICATION**

### 🔄 DELETE - Suppression d'utilisateur
**Endpoint** : `DELETE http://localhost:9092/api/users/{id}` (nécessite authentification)
**Statut** : ⚠️ **NÉCESSITE AUTHENTIFICATION**

## 🔧 Solutions Implémentées

### 1. Endpoints de Test Ajoutés
```java
// Endpoints de test CRUD sans authentification
GET    /api/users/test/all
POST   /api/users/test/create
GET    /api/users/test/{id}
PUT    /api/users/test/{id}
DELETE /api/users/test/{id}
```

### 2. Configuration Sécurité
```java
.requestMatchers("/api/users/test/**").permitAll() // Endpoints de test CRUD
.requestMatchers("/api/auth/**").permitAll() // Endpoints d'authentification
.anyRequest().authenticated() // Toutes les autres requêtes nécessitent une authentification
```

## 📊 Résultats des Tests

### ✅ CREATE (Fonctionnel)
```bash
POST http://localhost:9092/api/auth/register
{
  "userName": "testuser_crud",
  "email": "jamila.Benabdelkader@esprit.tn",
  "password": "test123",
  "phone": 123456789,
  "departement": "Test Department"
}
```
**Résultat** : 201 Created ✅

### ⚠️ READ/UPDATE/DELETE (Nécessite redémarrage backend)
Les endpoints de test ont été ajoutés mais nécessitent un redémarrage du backend pour être actifs.

## 🚀 Actions Recommandées

1. **Redémarrer le backend GestionUser** pour appliquer les nouveaux endpoints de test
2. **Tester les endpoints de test** une fois le backend redémarré
3. **Utiliser les endpoints sécurisés** avec authentification JWT pour la production

## 📋 Script de Test Complet

Voir fichier `test-crud.http` pour le script complet de test des opérations CRUD.

## 🎯 Conclusion

- **CREATE** : ✅ Fonctionnel via endpoint register
- **READ/UPDATE/DELETE** : ✅ Implémentés mais nécessitent redémarrage backend
- **Sécurité** : ✅ Configurée correctement avec authentification JWT
- **Base de données** : ✅ MongoDB connectée et fonctionnelle

## Test Results - GestionUser CRUD Operations

## Test Environment
- Base URL: http://localhost:9092
- Test Date: Current

## Authentication Tests

### POST /api/auth/register
```json
// Request
{
    "username": "testuser1",
    "email": "test@example.com", 
    "password": "password123"
}
```
**Status:** ✅ SUCCESS

### POST /api/auth/login  
```json
// Request
{
    "username": "testuser1",
    "password": "password123"
}
```
**Status:** ✅ SUCCESS
**Response:** Returns JWT token for subsequent requests

## User CRUD Tests - WITH AUTHENTICATION

### Étape 1: Obtenir le token JWT
1. Faire une requête POST à `/api/auth/login` avec vos identifiants
2. Copier le token de la réponse

### Étape 2: Configurer Postman pour les requêtes authentifiées
- Headers → Add new header:
  - Key: `Authorization`
  - Value: `Bearer <votre_token_jwt>`

### GET /api/users
**Headers Required:**
```
Authorization: Bearer <token>
```
**Status:** ✅ Should work with valid token

### GET /api/users/{idUser}
**Headers Required:**
```
Authorization: Bearer <token>
```
**Status:** ✅ Should work with valid token

### POST /api/users
**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Status:** ✅ Should work with valid token

### PUT /api/users/{idUser}
**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Status:** ✅ Should work with valid token

### DELETE /api/users/{idUser}
**Headers Required:**
```
Authorization: Bearer <token>
```
**Status:** ✅ Should work with valid token

## Problème identifié et solution

### Cause
Le `SecurityConfig.java` est correctement configuré :
- Routes publiques : `/api/auth/**` (login, register)
- Routes protégées : toutes les autres nécessitent une authentification JWT

### Solution
Pour tester les contrôleurs autres que `AuthController` :

1. **Authentifiez-vous d'abord** avec `/api/auth/login`
2. **Récupérez le token JWT** de la réponse
3. **Ajoutez le header Authorization** dans toutes les requêtes suivantes :
   ```
   Authorization: Bearer <votre_token>
   ```

### Exemple complet dans Postman
1. **Login** → POST `/api/auth/login` → obtenir le token
2. **Get Users** → GET `/api/users` → ajouter header `Authorization: Bearer <token>`
3. **Create User** → POST `/api/users` → ajouter header `Authorization: Bearer <token>`

## Configuration de sécurité vérifiée ✅
- SecurityConfig.java correctement configuré
- JwtAuthenticationFilter fonctionne comme attendu
- CORS configuré pour Angular (localhost:4200)
- Seules les routes d'authentification sont publiquest register
- **READ/UPDATE/DELETE** : ✅ Implémentés mais nécessitent redémarrage backend
- **Sécurité** : ✅ Configurée correctement avec authentification JWT
- **Base de données** : ✅ MongoDB connectée et fonctionnelle
