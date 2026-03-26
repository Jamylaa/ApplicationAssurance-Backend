# Documentation AI Service
Cette documentation contient toutes les informations techniques sur l'architecture et l'utilisation du service AI.
##  Documents Disponibles
- [CHATBOT_ARCHITECTURE.md](CHATBOT_ARCHITECTURE.md) - Architecture détaillée des chatbots séparés
- [API_ENDPOINTS.md](API_ENDPOINTS.md) - Documentation complète des endpoints API
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Guide d'implémentation pas à pas
## Points Clés
### Architecture Séparée
- **RecommendationChatbot** : Spécialisé dans les recommandations pour les clients
- **ChatbotEngine** : Spécialisé dans la création d'entités pour les admins
- **Services dédiés** : Chaque chatbot a son propre service Angular
### Frontend Angular
- **Services séparés** : `RecommendationChatbotService` et `AdminChatbotService`
- **Composants spécialisés** : Interfaces adaptées pour chaque usage
- **Routing distinct** : Accès séparés dans l'interface admin
### Backend Flask
- **Endpoints dédiés** : `/api/recommendation-chat/*` et `/api/admin-chat/*`
- **Serveur unifié** : `app_separated.py` gère les deux chatbots
- **Tests complets** : Validation d'intégration
## Utilisation Rapide
1. **Démarrer le backend** : `python app_separated.py`
2. **Lancer les tests** : `python tests/test_integration.py`
3. **Accéder frontend** : Interface Angular avec routes séparées