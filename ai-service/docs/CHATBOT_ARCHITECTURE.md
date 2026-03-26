# Architecture des Chatbots - Système d'Assurance Vermeg
## Vue d'ensemble
Le système de chatbots Vermeg est maintenant organisé en deux modules distincts et spécialisés :
### 1. Chatbot de Recommandation (`recommendation_chatbot.py`)
**Rôle :** Aider l'admin / les clients à trouver le pack d'assurance le plus adapté à leurs besoins.
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
## Avantages de cette Architecture
###  **Spécialisation**
- Chaque chatbot a une responsabilité unique
- Code plus simple et maintenable
- Moins de risques de bugs croisés
### **Maintenance Facilitée**
- Modifications isolées par module
- Tests unitaires spécifiques
- Déploiement indépendant possible
###  **Performance**
- Seules les fonctionnalités nécessaires sont chargées
- Mémoire optimisée
- Temps de réponse réduit
###  **Sécurité**
- Séparation claire des rôles
- Droits d'accès différenciés
- Moins de surface d'attaque
## Structure des Fichiers
```
ai-service/
├── chatbot/
│   ├── recommendation_chatbot.py    # Chatbot de recommandation
│   └── chatbot_engine.py           # Chatbot d'administration
├── test_recommendation_chatbot.py  # Tests du chatbot de recommandation
└── app.py                         # Point d'entrée principal
```
## Utilisation
### Chatbot de Recommandation
```python
from chatbot.recommendation_chatbot import RecommendationChatbot
# Initialisation
chatbot = RecommendationChatbot()
# Message de bienvenue
welcome = chatbot.get_welcome_message()
# Traitement des messages
result = chatbot.process_message(message, history, client_id)
```
### Chatbot d'Administration
```python
from chatbot.chatbot_engine import ChatbotEngine

# Initialisation
chatbot = ChatbotEngine()

# Traitement en mode création
result = chatbot.process_message(message, history, mode="creation")

# Traitement en mode recommandation (compatibilité)
result = chatbot.process_message(message, history, mode="recommendation")
```
## Tests
### Tests du Chatbot de Recommandation
```bash
cd ai-service
python test_recommendation_chatbot.py
```
Les tests couvrent :
- Extraction des données (âge, sexe, booléens)
- Conversation complète
- Champs conditionnels
- Calcul de progression
- Génération de résumé
### Tests du Chatbot d'Administration
Les tests existants dans `test_admin_recommendation.py` continuent de fonctionner.
## Configuration
### Variables d'Environnement
```bash
# Service de recommandation
RECOMMENDATION_SERVICE_URL=http://localhost:9095

# Service produit
PRODUCT_SERVICE_URL=http://localhost:9093
```
## Migration
Le `chatbot_engine.py` original conserve la compatibilité avec le mode `"recommendation"` pour ne pas casser les intégrations existantes. Cependant, il est recommandé d'utiliser directement le `RecommendationChatbot` pour les nouvelles implémentations.
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
## Conclusion
Cette architecture séparée offre une base solide pour l'évolution du système de chatbots Vermeg. Elle combine simplicité, performance et évolutivité tout en maintenant la compatibilité avec les intégrations existantes.