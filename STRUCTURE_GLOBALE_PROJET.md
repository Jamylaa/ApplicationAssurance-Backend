#  STRUCTURE GLOBALE DU PROJET VERMEG

## VUE D'ENSEMBLE
Projet de microservices pour la gestion d'assurances avec architecture Spring Boot + Angular.
---
##  ARCHITECTURE COMPLÈTE

### **Services Backend (Spring Boot)**
```
ProjtVermeg/
├── Eureka/                    # Service Discovery (Port: 8761)
├── Gateway/                   # API Gateway (Port: 9091)
├── GestionUser/              # Service Utilisateurs (Port: 9092)
├── GestionProduit/           # Service Produits (Port: 9093)
├── GestionSouscription/       # Service Souscriptions (Port: 9094)
├── Recommendation/           # Service Recommandations (Port: 9095)
```
### **Frontend (Angular)**
```
frontend/                     # Application Angular (Port: 4200)
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── core/
│   │   ├── shared/
│   │   └── models/
│   ├── assets/
│   └── environments/
├── angular.json
├── package.json
└── tsconfig.json
```

---

##  DÉTAIL DES SERVICES

### **1.  GestionUser (Port: 9092)**
**Fonction:** Authentification et gestion des utilisateurs

#### **Structure**
```
GestionUser/src/main/java/tn/vermeg/gestionuser/
├── GestionUserApplication.java
├── config/
│   ├── MongoConfig.java
│   └── CorsConfig.java
├── controllers/
│   ├── AuthController.java      # /api/auth/**
│   ├── AdminController.java     # /api/admins/**
│   └── UserController.java      # /api/users/**
├── dto/
│   ├── AuthRequest.java
│   ├── RegisterRequest.java
│   └── ValidationResult.java
├── entities/
│   ├── User.java              # Entité de base simplifiée
│   └── Admin.java             # Hérite de User
├── repositories/
│   ├── UserRepository.java
│   └── AdminRepository.java
├── security/
│   ├── DefinitiveSecurityConfig.java
│   ├── NoSecurityConfig.java
│   └── PasswordService.java
├── services/
│   ├── AdminService.java
│   ├── UserService.java
│   ├── AuthService.java
│   └── impl/
│       ├── AdminServiceImpl.java
│       └── UserServiceImpl.java
└── utils/
    └── JwtUtil.java
```

#### **Endpoints**
- `POST /api/auth/login` - Authentification
- `POST /api/auth/register` - Inscription
- `GET /api/admins/getAllAdmins` - Liste admins
- `GET /api/users` - Liste utilisateurs
- `POST /api/admins/createAdmin` - Créer admin

---

### **2.  GestionProduit (Port: 9093)**
**Fonction:** Gestion des produits d'assurance

#### **Structure**
```
GestionProduit/src/main/java/tn/vermeg/gestionproduit/
├── controllers/
│   ├── ProduitController.java
│   ├── PackController.java
│   └── GarantieController.java
├── entities/
│   ├── Produit.java
│   ├── Pack.java
│   └── Garantie.java
├── repositories/
│   ├── ProduitRepository.java
│   ├── PackRepository.java
│   └── GarantieRepository.java
└── services/
    ├── ProduitService.java
    ├── PackService.java
    └── GarantieService.java
```

---

### **3.  GestionSouscription (Port: 9094)**
**Fonction:** Gestion des souscriptions aux contrats

#### **Structure**
```
GestionSouscription/src/main/java/tn/vermeg/gestionsouscription/
├── controllers/
│   └── SouscriptionController.java
├── entities/
│   ├── Souscription.java
│   └── Contrat.java
├── repositories/
│   └── SouscriptionRepository.java
└── services/
    └── SouscriptionService.java
```

---

### **4.  Recommendation (Port: 9095)**
**Fonction:** Service de recommandations AI

#### **Structure**
```
Recommendation/src/main/java/tn/vermeg/recommendation/
├── controllers/
│   └── RecommendationController.java
├── entities/
│   ├── Recommendation.java
│   └── Questionnaire.java
├── repositories/
│   └── RecommendationRepository.java
└── services/
    └── RecommendationService.java
```

---

### **5.  Gateway (Port: 9091)**
**Fonction:** Point d'entrée unique et routage

#### **Structure**
```
Gateway/src/main/java/tn/vermeg/gateway/
├── GatewayApplication.java
├── config/
│   └── GatewayConfig.java
└── routes/
    └── RouteConfig.java
```

---

### **6.  Eureka (Port: 8761)**
**Fonction:** Service Discovery

#### **Structure**
```
Eureka/src/main/java/tn/vermeg/eureka/
├── EurekaApplication.java
└── config/
    └── EurekaConfig.java
```

---

##  FRONTEND ANGULAR

### **Structure Complète**
```
frontend/src/app/
├── admin/
│   ├── admin-dashboard/
│   ├── manage-garantie/
│   ├── manage-pack/
│   └── manage-produit/
├── auth/
│   ├── login/
│   └── register/
├── core/
│   ├── auth.service.ts          # Service d'authentification
│   ├── services/
│   │   ├── admin.service.ts
│   │   ├── produit.service.ts
│   │   ├── pack.service.ts
│   │   └── souscription.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── interceptors/
│       └── auth.interceptor.ts
├── shared/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── produit-card/
│   │   └── souscription-card/
│   └── models/
├── models/
│   ├── entities.model.ts       # Modèles des entités
│   ├── enums.ts               # Énumérations
│   └── recommendation.model.ts
└── app.component.ts
```

### **Fichiers de Build et Dépendances**
```bash
# 📦 Fichiers build inutiles
✅ node_modules/              # Répertoire entier
✅ package-lock.json
✅ package.json              # Si pas utilisé pour le backend
✅ .venv/                   # Environnement virtuel Python
```

### **Fichiers de Log et Configuration IDE**
```bash
# 🗂️ Logs et IDE
✅ gestionuser-debug.log
✅ gestionuser-error.log
✅ gestionuser.log
✅ .idea/                   # Configuration IntelliJ
✅ .git/                    # Garder pour version control
```
---

##  STRUCTURE FINALE OPTIMISÉE
```
ProjtVermeg/
├── README.md                 # Documentation unique
├── pom.xml                   # Maven parent
├── .gitignore
├── Eureka/
├── Gateway/
├── GestionUser/
├── GestionProduit/
├── GestionSouscription/
├── Recommendation/
├── ai-service/
└── frontend/
```

### **Documentation Unique**
```
README.md
├──  Vue d'ensemble
├── ️ Architecture
├── Démarrage rapide
├──  Documentation API
├──  Configuration
└──  Tests
```