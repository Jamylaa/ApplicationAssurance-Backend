# 🏢 Projet Vermeg - Gestion d'Assurances

## 📋 Vue d'Ensemble

Projet de microservices pour la gestion d'assurances avec architecture Spring Boot + Angular, optimisé pour un contexte PFE.

---

## 🏗️ Architecture des Microservices

### **Services Backend (Spring Boot)**
```
├── 🔍 Eureka (Port: 8761)        # Service Discovery
├── 🌐 Gateway (Port: 9091)        # API Gateway
├── 👥 GestionUser (Port: 9092)   # Authentification & Utilisateurs
├── 📦 GestionProduit (Port: 9093) # Produits d'Assurance
├── 📝 GestionSouscription (9094) # Souscriptions
├── 🤖 Recommendation (9095)      # AI Recommendations
└── 🧠 AI Service (Port: 5000)    # Service AI externe
```

### **Frontend (Angular)**
```
🎨 Frontend (Port: 4200)           # Application Angular 17
├── 🔐 Authentification simplifiée
├── 👤 Gestion des utilisateurs
├── 📦 Gestion des produits
├── 📝 Gestion des souscriptions
└── 🤖 Interface de recommandations
```

---

## 🚀 Démarrage Rapide

### **Prérequis**
- Java 17+
- Node.js 18+
- MongoDB
- Maven

### **1. Démarrer les Services Backend**
```bash
# Service Discovery
cd Eureka
mvn spring-boot:run

# API Gateway
cd Gateway
mvn spring-boot:run

# Gestion User
cd GestionUser
mvn spring-boot:run

# Gestion Produit
cd GestionProduit
mvn spring-boot:run

# Gestion Souscription
cd GestionSouscription
mvn spring-boot:run

# Recommendation
cd Recommendation
mvn spring-boot:run
```

### **2. Démarrer le Frontend**
```bash
cd frontend
npm install
ng serve
```

### **3. Accéder à l'Application**
- 🌐 **Frontend**: http://localhost:4200
- 🔍 **Eureka**: http://localhost:8761
- 🌐 **Gateway**: http://localhost:9091
- 📚 **API Documentation**: http://localhost:9091/swagger-ui.html

---

## 📚 Documentation API

### **Authentication Service (Port: 9092)**
```bash
# Login
POST /api/auth/login
Content-Type: application/json
{
  "userName": "admin",
  "password": "admin123"
}

# Register
POST /api/auth/register
Content-Type: application/json
{
  "userName": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "phone": 123456789,
  "departement": "IT"
}
```

### **User Management**
```bash
# Get All Users
GET /api/users
Authorization: Bearer <token>

# Get All Admins
GET /api/admins/getAllAdmins
Authorization: Bearer <token>

# Create Admin
POST /api/admins/createAdmin
Authorization: Bearer <token>
Content-Type: application/json
{
  "userName": "admin2",
  "email": "admin2@example.com",
  "password": "admin123",
  "phone": 987654321,
  "departement": "Finance"
}
```

---

## 🔧 Configuration

### **Base de Données MongoDB**
```yaml
# application.properties (GestionUser)
spring.data.mongodb.uri=mongodb://localhost:27017/vermeg_db

# application.properties (GestionProduit)
spring.data.mongodb.uri=mongodb://localhost:27017/vermeg_db

# application.properties (Recommendation)
spring.data.mongodb.uri=mongodb://localhost:27017/recommendation_db
```

### **JWT Configuration**
```yaml
# application.properties
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
jwt.refresh-expiration=604800000
```

---

## 🧪 Tests

### **Test d'Authentification**
```bash
# Test avec curl
curl -X POST http://localhost:9092/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","password":"admin123"}'
```

### **Test des Services**
```bash
# Vérifier Eureka
curl http://localhost:8761/eureka/apps

# Vérifier Gateway
curl http://localhost:9091/actuator/health

# Vérifier GestionUser
curl http://localhost:9092/actuator/health
```

---

## 🎯 Fonctionnalités Principales

### **✅ Authentification Simplifiée**
- 🔐 JWT Token-based authentication
- 👤 Un seul rôle d'utilisateur (simplifié pour PFE)
- 🛡️ Spring Security configuré
- 🌐 CORS activé pour Angular

### **✅ Gestion des Utilisateurs**
- 👥 CRUD complet sur les utilisateurs
- 📋 Validation des inputs
- 🔐 Password encryption avec BCrypt
- 📝 Logs détaillés pour debugging

### **✅ Microservices**
- 🔍 Service Discovery avec Eureka
- 🌐 API Gateway pour routage
- 📦 Communication inter-services
- 🧠 AI Service pour recommandations

### **✅ Frontend Angular**
- 🎨 Interface moderne et responsive
- 🔐 Guards d'authentification
- 📱 Components réutilisables
- 🌐 Services HTTP optimisés

---

## 📊 Structure du Projet

```
ProjtVermeg/
├── 📄 README.md                 # Documentation unique
├── 📦 pom.xml                   # Maven parent
├── 🚀 Eureka/                   # Service Discovery
├── 🌐 Gateway/                  # API Gateway
├── 👥 GestionUser/              # Authentification
├── 📦 GestionProduit/           # Produits
├── 📝 GestionSouscription/       # Souscriptions
├── 🤖 Recommendation/           # AI Service
├── 🧠 ai-service/              # AI Externe
└── 🎨 frontend/                # Angular App
```

---

## 🛠️ Technologies Utilisées

### **Backend**
- ☕ **Java 17** - Langage principal
- 🍃 **Spring Boot 3.x** - Framework
- 🗄️ **MongoDB** - Base de données
- 🔍 **Eureka** - Service Discovery
- 🌐 **Spring Cloud Gateway** - API Gateway
- 🔐 **Spring Security** - Sécurité
- 🎯 **JWT** - Authentification

### **Frontend**
- 🎨 **Angular 17** - Framework frontend
- 📱 **TypeScript** - Typage fort
- 🎯 **RxJS** - Programmation réactive
- 🌐 **Angular Material** - UI Components
- 📦 **HttpClient** - Requêtes HTTP

### **DevOps**
- 🐳 **Docker** - Conteneurisation
- 📦 **Maven** - Gestion des dépendances
- 🔧 **npm** - Package manager
- 🌐 **Git** - Version control

---

## 🎓 Objectif PFE

Ce projet a été simplifié et optimisé pour un contexte de Projet de Fin d'Études:

### **✅ Simplifications Appliquées**
- 🗑️ Suppression de la gestion complexe des rôles
- 🎯 Architecture simplifiée et maintenable
- 📚 Documentation unifiée et centralisée
- 🧹 Code propre et bien structuré

### **🎯 Points Forts pour PFE**
- 🏗️ Architecture de microservices moderne
- 🔐 Authentification JWT fonctionnelle
- 🎨 Frontend Angular responsive
- 📊 Base de données MongoDB
- 🤖 Intégration AI Service
- 📚 Documentation complète

---

## 🤝 Contributeurs

Projet réalisé dans le cadre d'un PFE (Projet de Fin d'Études) avec:

- 🏢 **Vermeg** - Entreprise partenaire
- 🎓 **Étudiants** - Développement complet
- 👨‍💻 **Encadrants** - Encadrement technique

---

## 📞 Support

Pour toute question ou problème:

1. 📋 Consulter la documentation ci-dessus
2. 🧪 Vérifier les logs des services
3. 🔍 Utiliser Swagger UI pour tester les APIs
4. 📝 Créer une issue sur le repository Git

---

## 🎉 Conclusion

Le projet Vermeg est maintenant **prêt pour la démonstration PFE** avec:

- ✅ **Architecture microservices** robuste
- ✅ **Code simplifié** et maintenable
- ✅ **Documentation complète** et unifiée
- ✅ **Frontend moderne** et responsive
- ✅ **Backend sécurisé** et performant

**Un projet idéal pour présenter les compétences en développement d'applications modernes !** 🚀
