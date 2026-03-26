# AI Service - Vermeg Insurance System

Service d'intelligence artificielle pour le système d'assurance Vermeg avec chatbots séparés.

## 🏗️ Architecture

- **Chatbot de Recommandation** : Aide les clients à trouver le pack d'assurance adapté
- **Chatbot d'Administration** : Permet aux admins de créer des garanties, produits et packs
- **Moteur de Scoring** : Algorithmes ML pour les recommandations personnalisées
## 🚀 Démarrage

### Prérequis
```bash
pip install -r requirements.txt
```

### Démarrer le service
```bash
python app_separated.py
```

Le service démarre sur `http://localhost:5000`

## 📡 API Endpoints

### Chatbot de Recommandation
- `POST /api/recommendation-chat/start` - Démarrer une conversation
- `POST /api/recommendation-chat` - Envoyer un message

### Chatbot d'Administration  
- `POST /api/admin-chat/start` - Démarrer une conversation admin
- `POST /api/admin-chat` - Envoyer un message admin

### Santé du Service
- `GET /api/health` - Vérifier l'état du service

## 🧪 Tests

### Tests d'intégration
```bash
python tests/test_integration.py
```

### Tests du chatbot de recommandation
```bash
python tests/test_recommendation_chatbot.py
```

## 📁 Structure

```
ai-service/
├── app_separated.py              # Application Flask principale
├── .env                         # Configuration environnement
├── requirements.txt             # Dépendances Python
├── chatbot/                     # Chatbots
│   ├── recommendation_chatbot.py
│   └── chatbot_engine.py
├── scoring/                     # Moteur ML
├── tests/                       # Tests
│   ├── test_integration.py
│   └── test_recommendation_chatbot.py
└── docs/                        # Documentation
```

## 🔧 Configuration

Variables d'environnement dans `.env`:
```
RECOMMENDATION_SERVICE_URL=http://localhost:9095
PRODUCT_SERVICE_URL=http://localhost:9093
PORT=5000
DEBUG=False
```

## 📚 Documentation

- [Architecture des Chatbots](docs/CHATBOT_ARCHITECTURE.md)
- [Documentation API](docs/API_ENDPOINTS.md)
- [Guide d'Implémentation](docs/IMPLEMENTATION_GUIDE.md)
