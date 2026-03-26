# Guide d'Intégration - PackChatbot
## Vue d'Ensemble
Le `PackChatbot` est une solution robuste pour la création de packs d'assurance avec parsing intelligent des entrées utilisateur et state machine fiable.
## Problèmes Résolus
### Avant (Problèmes)
- ❌ "2000DT" non compris → parsing échoue
- ❌ "24mois" non reconnu → durée invalide  
- ❌ "Oui"/"Non" parfois non reconnus
- ❌ Redemande des questions même si réponse correcte
- ❌ Décalage des champs (prix = âge, etc.)
- ❌ Validation fragile (duree_min = duree_max)
- ❌ Flux de conversation instable
### Après (Solution)
- ✅ Parsing intelligent de tous les formats
- ✅ Validation stricte et claire
- ✅ Association garantie réponse/champ
- ✅ State machine explicite
- ✅ Gestion d'erreurs intelligente
- ✅ Résumé détaillé avant confirmation
## Architecture
### State Machine
```
WELCOME → COLLECTING → VALIDATION → CONFIRMATION → CORRECTION → COMPLETED
```
### Parsing Intelligent
- **Texte** : Nettoyage des espaces
- **Liste** : Gestion des séparateurs variés (`,`, `;`, espaces)
- **Entier** : Conversion d'unités (`1an` → `12mois`)
- **Float** : Nettoyage des symboles (`2000DT` → `2000.0`)
- **Booléen** : Reconnaissance des variations (`Oui`, `oui`, `O`, etc.)
- **Choice** : Mapping des variations (`basic` → `BASIC`)
## Intégration
### 1. Import
```python
from chatbot.pack_chatbot import PackChatbot
```
### 2. Initialisation
```python
chatbot = PackChatbot()
```
### 3. API Flask (Exemple)
```python
@app.route('/api/pack-chat/start', methods=['POST'])
def start_pack_chat():
    chatbot = PackChatbot()  # Nouvelle instance
    return jsonify(chatbot.get_welcome_message())

@app.route('/api/pack-chat', methods=['POST'])
def pack_chat():
    data = request.get_json()
    message = data.get('message', '')
    
    # Récupérer ou créer l'instance du chatbot (session, base de données, etc.)
    chatbot = get_or_create_chatbot_session()
    
    response = chatbot.process_message(message)
    return jsonify(response)
```
## Formats d'Entrée Supportés
### Prix
- ✅ `2000`
- ✅ `2000DT` 
- ✅ `2000.5`
- ✅ `2000.50DT`
- ❌ `deux mille` (non supporté)
### Durée
- ✅ `24`
- ✅ `24mois`
- ✅ `24 mois`
- ✅ `2ans` (converti en `24mois`)
- ✅ `1an` (converti en `12mois`)
### Booléen
- ✅ `Oui`, `oui`, `OUI`
- ✅ `Non`, `non`, `NON`
- ✅ `O`, `o`, `1`
- ✅ `N`, `n`, `0`
- ✅ `actif`, `inactif`
### Niveau de Couverture
- ✅ `BASIC`, `basic`, `basique`
- ✅ `PREMIUM`, `premium`, `intermédiaire`
- ✅ `GOLD`, `gold`, `or`
### Liste d'IDs
- ✅ `PROD001,PROD002`
- ✅ `PROD001; PROD002`
- ✅ `PROD001 PROD002`
## ✅ Validations
### Par Champ
- **nom_pack** : ≥ 3 caractères
- **description** : ≥ 10 caractères  
- **produits_ids** : ≥ 1 élément
- **prix_mensuel** : > 0 et ≤ 10000 DT
- **duree_min** : 1-120 mois
- **duree_max** : > duree_min et ≤ 120 mois
- **niveau_couverture** : ∈ {BASIC, PREMIUM, GOLD}
- **actif** : booléen valide
### Métier
- `duree_min < duree_max`
- `prix_mensuel > 0`
- `produits_ids.length ≤ 10`
## 🔄 Flux de Conversation
### 1. Bienvenue
```
Bot: Bonjour ! Je suis votre assistant de création de packs...
Bot: Quel est le nom du pack d'assurance ?
```
### 2. Collecte
```
User: Pack Famille Gold
Bot: ✅ Bien enregistré : Pack Famille Gold
Bot: Quelle est la description du pack ?
```
### 3. Validation
```
Bot: ❌ Erreurs de validation détectées :
Bot: • La durée minimale (24 mois) doit être inférieure à la durée maximale (12 mois)
Bot: Voulez-vous corriger ces erreurs ? (Oui/Non)
```
### 4. Confirmation
```
Bot: 📋 Récapitulatif du Pack d'Assurance
Bot: • Nom du pack: Pack Famille Gold
Bot: • Prix mensuel: 2000.00 DT
Bot: ...
Bot: Confirmez-vous la création de ce pack ? (Oui/Non)
```
### 5. Correction
```
User: non
Bot: Quel champ souhaitez-vous corriger ?
User: prix_mensuel
Bot: Quelle est la nouvelle valeur pour Quel est le prix mensuel du pack ?
User: 2500DT
Bot: ✅ Bien enregistré : 2500.00 DT
```
## 🧪 Tests
### Exécuter les tests
```bash
cd ai-service
python tests/test_pack_chatbot.py
```
### Tests couverts
- ✅ Parsing intelligent
- ✅ Validation des règles
- ✅ Gestion des erreurs
- ✅ Flux de correction
- ✅ Cas limites
- ✅ Flux complet
## 🚀 Déploiement
### Variables d'environnement
```bash
PRODUCT_SERVICE_URL=http://localhost:9093
```
### Endpoints API
```bash
POST /api/pack-chat/start    # Démarrer nouvelle conversation
POST /api/pack-chat          # Continuer conversation
```
## 🔍 Debug
### Logs activés
```python
# Dans la console, vous verrez :
DEBUG: État actuel: collecting
DEBUG: Message brut: '2000DT'
DEBUG: Parsing intelligent pour 'prix_mensuel' (type: float) depuis '2000DT'
DEBUG: Valeur validée et stockée: prix_mensuel = 2000.0
```
### États possibles
- `welcome` : Message de bienvenue
- `collecting` : Collecte des données
- `validation` : Validation des données
- `confirmation` : Confirmation finale
- `correction` : Correction d'un champ
- `completed` : Création terminée
## 📊 Réponse Format
### Structure JSON
```json
{
  "response": "Message du chatbot",
  "state": "collecting",
  "is_complete": false,
  "current_field": "prix_mensuel",
  "progress": 50,
  "examples": ["2000", "2000DT", "2000.5"],
  "collected_data": {...},
  "validation_errors": [...],
  "pack_id": "PACK123"
}
```
## 🎯 Avantages
### Fiabilité
- **Zéro décalage** : Association garantie réponse/champ
- **Parsing robuste** : Gère les formats variés
- **Validation stricte** : Pas de données invalides
### Expérience Utilisateur
- **Messages clairs** : L'utilisateur sait quoi faire
- **Exemples fournis** : Guide l'utilisateur
- **Correction facile** : Un champ à la fois
### Maintenance
- **Code simple** : State machine explicite
- **Tests complets** : Couverture élevée
- **Documentation** : Guide détaillé
## 🔄 Migration
### Depuis l'ancien chatbot
1. **Tester** d'abord avec `pack_chatbot.py`
2. **Intégrer** dans Flask existant
3. **Remplacer** progressivement l'ancien système
4. **Adapter** le pattern pour autres entités
### Personnalisation
```python
# Ajouter un nouveau champ
{
    "key": "nouveau_champ",
    "question": "Question pour le nouveau champ ?",
    "type": "text",
    "required": True,
    "validation": lambda x: len(x) > 5,
    "error_message": "Message d'erreur personnalisé",
    "examples": ["exemple1", "exemple2"]
}
```
---
Cette solution garantit une création de packs **fiable, intuitive et sans erreur** !