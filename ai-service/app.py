"""
Application Flask principale pour le service AI
Point d'entrée du service de recommandation et chatbots
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
from services.enhanced_recommendation_service import EnhancedRecommendationService
from services.google_api_service import GoogleAPIService
from services.hybrid_recommendation_engine import HybridRecommendationEngine

# Initialiser l'application Flask
app = Flask(__name__)

# Configuration CORS améliorée
CORS(app, 
     origins=["http://localhost:4200", "http://127.0.0.1:4200"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Authorization", "Content-Type", "Accept", "Origin", 
                   "Access-Control-Request-Method", "Access-Control-Request-Headers",
                   "X-Requested-With", "Cache-Control"],
     supports_credentials=True)

# Configuration Flask depuis api_config
app.config.update(api_config.get_flask_config())

# Initialiser les services
enhanced_service = EnhancedRecommendationService()
google_service = GoogleAPIService()
hybrid_engine = HybridRecommendationEngine()

# Routes pour les API de recommandation
@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifier si le service est fonctionnel"""
    print("=== AI SERVICE HEALTH CHECK ===")
    config_validation = api_config.validate_config()
    
    print("Google API Key configured:", google_service.is_configured())
    print("Config validation:", config_validation)
    print("==============================")
    
    return jsonify({
        "status": "healthy",
        "service": "AI Service",
        "version": "1.0.0",
        "config": config_validation,
        "services": {
            "google_api": google_service.is_configured(),
            "enhanced_recommendations": True,
            "hybrid_engine": True
        }
    })

@app.route('/api/recommendation-chat/start', methods=['POST'])
def start_recommendation_chat():
    """Démarrer une conversation de recommandation"""
    print("=== AI SERVICE - START RECOMMENDATION CHAT ===")
    print("Method:", request.method)
    print("Headers:", dict(request.headers))
    
    try:
        data = request.get_json() or {}
        client_id = data.get('client_id', 'default')
        
        print("Client ID:", client_id)
        print("Data received:", data)
        
        # Utiliser le moteur hybride pour les recommandations
        response = hybrid_engine.start_conversation(client_id)
        
        print("Response generated successfully")
        print("===========================================")
        
        return jsonify(response)
    except Exception as e:
        print("Error in start_recommendation_chat:", str(e))
        print("===========================================")
        return jsonify({
            "error": "Erreur lors du démarrage de la conversation",
            "details": str(e)
        }), 500

@app.route('/api/recommendation-chat', methods=['POST'])
def continue_recommendation_chat():
    """Continuer une conversation de recommandation"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
            
        message = data.get('message', '')
        conversation_history = data.get('conversation_history', [])
        client_id = data.get('client_id', 'default')
        
        response = hybrid_engine.process_message(message, conversation_history, client_id)
        
        return jsonify(response)
    except Exception as e:
        return jsonify({
            "error": "Erreur lors du traitement du message",
            "details": str(e)
        }), 500

@app.route('/api/recommendations/enhanced', methods=['POST'])
def get_enhanced_recommendations():
    """Obtenir des recommandations améliorées avec données réelles"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
            
        user_profile = data.get('user_profile', {})
        location = data.get('location', None)
        
        recommendations = enhanced_service.get_recommendations(user_profile, location)
        
        return jsonify({
            "recommendations": recommendations,
            "user_profile": user_profile,
            "location": location,
            "timestamp": enhanced_service.get_current_timestamp()
        })
    except Exception as e:
        return jsonify({
            "error": "Erreur lors de la génération des recommandations",
            "details": str(e)
        }), 500

@app.route('/api/admin-chat/start', methods=['POST'])
def start_admin_chat():
    """Démarrer une conversation d'administration"""
    try:
        from chatbot.unified_pack_chatbot import PackChatbot
        
        chatbot = PackChatbot()
        response = chatbot.get_welcome_message()
        
        return jsonify(response)
    except Exception as e:
        return jsonify({
            "error": "Erreur lors du démarrage de la conversation admin",
            "details": str(e)
        }), 500

@app.route('/api/admin-chat', methods=['POST'])
def continue_admin_chat():
    """Continuer une conversation d'administration"""
    try:
        from chatbot.unified_pack_chatbot import PackChatbot
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
            
        message = data.get('message', '')
        
        # Note: Pour une vraie implémentation, il faudrait gérer les sessions
        chatbot = PackChatbot()
        response = chatbot.process_message(message)
        
        return jsonify(response)
    except Exception as e:
        return jsonify({
            "error": "Erreur lors du traitement du message admin",
            "details": str(e)
        }), 500

# Routes pour les services Google API
@app.route('/api/google/places', methods=['GET'])
def search_places():
    """Rechercher des lieux via Google Places API"""
    try:
        query = request.args.get('query', '')
        location = request.args.get('location', None)
        radius = request.args.get('radius', None)
        
        if not query:
            return jsonify({"error": "Paramètre 'query' requis"}), 400
        
        if radius:
            radius = int(radius)
        
        result = google_service.search_places(query, location, radius)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": "Erreur lors de la recherche de lieux",
            "details": str(e)
        }), 500

# Gestion des erreurs
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint non trouvé"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Erreur interne du serveur"}), 500

# Point d'entrée
if __name__ == '__main__':
    # Valider la configuration au démarrage
    config_validation = api_config.validate_config()
    
    if not config_validation['is_valid']:
        print("WARNING: Configuration invalide:")
        for error in config_validation['errors']:
            print(f"  - {error}")
    
    # Démarrer l'application
    port = api_config.flask_port
    debug = api_config.flask_debug
    
    print(f"Démarrage du service AI sur le port {port}")
    print(f"Mode debug: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
