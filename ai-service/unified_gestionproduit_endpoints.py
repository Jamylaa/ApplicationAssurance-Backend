"""
Service unifié pour les endpoints de gestion de produits
Intégre les chatbots et les services de recommandation
"""

import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Ajouter les répertoires au chemin Python
sys.path.append(os.path.join(os.path.dirname(__file__), 'config'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'chatbot'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'scoring'))

from api_config import api_config

# Initialiser l'application Flask
app = Flask(__name__)
CORS(app, origins=["http://localhost:4200"])

# Configuration
PORT = int(os.getenv("FLASK_PORT", "5001"))
DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"

# Routes principales
@app.route('/api/ai/unified/health', methods=['GET'])
def health_check():
    """Vérifier si le service est fonctionnel"""
    return jsonify({
        "status": "healthy",
        "service": "Unified AI Service",
        "version": "1.0.0",
        "port": PORT,
        "debug": DEBUG
    })

@app.route('/api/ai/unified/info', methods=['GET'])
def service_info():
    """Informations sur le service"""
    return jsonify({
        "name": "Unified AI Service",
        "description": "Service unifié pour la gestion de produits avec IA",
        "endpoints": {
            "chatbot": ["/api/ai/unified/start", "/api/ai/unified/chat"],
            "creation": ["/api/ai/unified/*/quick-create"],
            "configuration": ["/api/ai/unified/*/configure"],
            "system": ["/api/ai/unified/health", "/api/ai/unified/info"]
        },
        "services": {
            "recommendation": "Enhanced recommendation engine",
            "chatbot": "Multi-entity chatbot system",
            "google_api": "Google Places API integration"
        }
    })

@app.route('/api/ai/unified/start', methods=['POST'])
def start_unified_chat():
    """Démarrer une conversation unifiée"""
    try:
        data = request.get_json() or {}
        entity_type = data.get('entity_type', 'pack')
        client_id = data.get('client_id', 'default')
        
        return jsonify({
            "response": f"Bonjour ! Je suis votre assistant unifié pour les {entity_type}s. Comment puis-je vous aider ?",
            "entity_type": entity_type,
            "client_id": client_id,
            "next_field": "intent",
            "progress": 0,
            "is_complete": False,
            "available_entities": ["pack", "garantie", "produit"],
            "collected_data": {}
        })
    except Exception as e:
        return jsonify({
            "error": "Erreur lors du démarrage de la conversation",
            "details": str(e)
        }), 500

@app.route('/api/ai/unified/chat', methods=['POST'])
def continue_unified_chat():
    """Continuer une conversation unifiée"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
            
        message = data.get('message', '')
        entity_type = data.get('entity_type', 'pack')
        conversation_history = data.get('conversation_history', [])
        client_id = data.get('client_id', 'default')
        
        # Logique simple de réponse basée sur l'entité
        if entity_type == "pack":
            response = handle_pack_message(message, conversation_history)
        elif entity_type == "garantie":
            response = handle_garantie_message(message, conversation_history)
        elif entity_type == "produit":
            response = handle_produit_message(message, conversation_history)
        else:
            response = {
                "response": "Je ne gère pas ce type d'entité. Choisissez entre pack, garantie ou produit.",
                "entity_type": entity_type,
                "next_field": "entity_type",
                "progress": 0,
                "is_complete": False,
                "collected_data": {"error": "entity_not_supported"}
            }
        
        response.update({
            "entity_type": entity_type,
            "client_id": client_id,
            "conversation_history": conversation_history + [
                {"role": "user", "content": message},
                {"role": "assistant", "content": response.get("response", "")}
            ]
        })
        
        return jsonify(response)
    except Exception as e:
        return jsonify({
            "error": "Erreur lors du traitement du message",
            "details": str(e)
        }), 500

@app.route('/api/ai/unified/<entity_type>/quick-create', methods=['POST'])
def quick_create_entity(entity_type):
    """Création rapide d'une entité"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
            
        # Simuler la création d'entité
        entity_id = f"{entity_type.upper()}_{hash(str(data)) % 10000}"
        
        return jsonify({
            "success": True,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "message": f"{entity_type.capitalize()} créé avec succès",
            "data": data,
            "created_at": "2024-01-01T00:00:00Z"
        })
    except Exception as e:
        return jsonify({
            "error": f"Erreur lors de la création du {entity_type}",
            "details": str(e)
        }), 500

@app.route('/api/ai/unified/<entity_type>/configure', methods=['POST'])
def configure_entity(entity_type):
    """Configuration d'une entité"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
            
        return jsonify({
            "success": True,
            "entity_type": entity_type,
            "message": f"{entity_type.capitalize()} configuré avec succès",
            "configuration": data,
            "options": {
                "notifications": True,
                "auto_save": True,
                "validation": "strict"
            }
        })
    except Exception as e:
        return jsonify({
            "error": f"Erreur lors de la configuration du {entity_type}",
            "details": str(e)
        }), 500

# Fonctions de traitement des messages
def handle_pack_message(message, history):
    """Traite les messages pour les packs"""
    message_lower = message.lower()
    
    if "créer" in message_lower or "nouveau" in message_lower:
        return {
            "response": "Je peux vous aider à créer un nouveau pack. Quel est le nom du pack ?",
            "next_field": "nom_pack",
            "progress": 10,
            "is_complete": False,
            "collected_data": {"intent": "create_pack"}
        }
    elif "prix" in message_lower:
        return {
            "response": "Pour le prix, veuillez spécifier le montant mensuel en DT.",
            "next_field": "prix_mensuel",
            "progress": 30,
            "is_complete": False,
            "collected_data": {"intent": "set_price"}
        }
    else:
        return {
            "response": "Je comprends. Pour continuer, que souhaitez-vous faire avec ce pack ? (créer, modifier, consulter)",
            "next_field": "action",
            "progress": 5,
            "is_complete": False,
            "collected_data": {"message": message}
        }

def handle_garantie_message(message, history):
    """Traite les messages pour les garanties"""
    message_lower = message.lower()
    
    if "créer" in message_lower or "nouvelle" in message_lower:
        return {
            "response": "Je peux vous aider à créer une nouvelle garantie. Quel est le nom de la garantie ?",
            "next_field": "nom_garantie",
            "progress": 10,
            "is_complete": False,
            "collected_data": {"intent": "create_garantie"}
        }
    elif "taux" in message_lower or "remboursement" in message_lower:
        return {
            "response": "Pour le taux de remboursement, veuillez spécifier un pourcentage entre 0 et 100.",
            "next_field": "taux_remboursement",
            "progress": 30,
            "is_complete": False,
            "collected_data": {"intent": "set_rate"}
        }
    else:
        return {
            "response": "Pour les garanties, je peux vous aider à créer, modifier ou consulter. Que souhaitez-vous faire ?",
            "next_field": "action",
            "progress": 5,
            "is_complete": False,
            "collected_data": {"message": message}
        }

def handle_produit_message(message, history):
    """Traite les messages pour les produits"""
    message_lower = message.lower()
    
    if "créer" in message_lower or "nouveau" in message_lower:
        return {
            "response": "Je peux vous aider à créer un nouveau produit. Quel est le nom du produit ?",
            "next_field": "nom_produit",
            "progress": 10,
            "is_complete": False,
            "collected_data": {"intent": "create_produit"}
        }
    elif "catégorie" in message_lower or "type" in message_lower:
        return {
            "response": "Pour la catégorie, veuillez choisir parmi: Assurance Vie, Assurance Santé, Assurance Auto.",
            "next_field": "categorie",
            "progress": 20,
            "is_complete": False,
            "collected_data": {"intent": "set_category"}
        }
    else:
        return {
            "response": "Pour les produits, je peux vous aider à créer, modifier ou consulter. Que souhaitez-vous faire ?",
            "next_field": "action",
            "progress": 5,
            "is_complete": False,
            "collected_data": {"message": message}
        }

# Gestion des erreurs
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint non trouvé"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Erreur interne du serveur"}), 500

# Point d'entrée
if __name__ == '__main__':
    print(f"Démarrage du service unifié sur le port {PORT}")
    print("Endpoints disponibles:")
    print("- Chatbot: /api/ai/unified/start, /api/ai/unified/chat")
    print("- Création rapide: /api/ai/unified/*/quick-create")
    print("- Configuration: /api/ai/unified/*/configure")
    print("- Système: /api/ai/unified/health, /api/ai/unified/info")
    
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
