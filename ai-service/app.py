"""
Application Flask principale pour le service AI
Point d'entrée du service de recommandation et chatbots
"""

import os
import sys
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Ajouter les répertoires au chemin Python
sys.path.append(os.path.join(os.path.dirname(__file__), 'config'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'chatbot'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'scoring'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'models'))

from api_config import api_config
from services.enhanced_recommendation_service import EnhancedRecommendationService
from services.google_api_service import GoogleAPIService
from services.hybrid_recommendation_engine import HybridRecommendationEngine
from services.assurance_nlp_service import AssuranceNLPService
from services.assurance_integration_service import AssuranceIntegrationService
from chatbot.unified_intelligent_chatbot import create_unified_chatbot

# Initialiser l'application Flask
app = Flask(__name__)

# Configuration CORS améliorée
CORS(app, 
     origins=["http://localhost:4200"],
     methods=["GET", "POST", "PUT", "DELETE"],
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
assurance_nlp_service = AssuranceNLPService()
assurance_integration_service = AssuranceIntegrationService(api_config.product_service_url)

# Importer le processeur one-shot
from services.one_shot_processor import OneShotProcessor
one_shot_processor = OneShotProcessor()

# Gestion des sessions pour les chatbots
chatbot_sessions = {}

# Routes pour les API de recommandation
@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifier si le service est fonctionnel"""
    print("=== AI SERVICE HEALTH CHECK ===")
    config_validation = api_config.validate_config()
    
    print("Google API Key configured:", google_service.is_configured())
    print("Config validation:", config_validation)

    return jsonify({
        "status": "healthy",
        "service": "AI Service",
        "version": "1.0.0",
        "config": config_validation,
        "services": {
            "google_api": google_service.is_configured(),
            "enhanced_recommendations": True,
            "hybrid_engine": True,
            "assurance_nlp": True
        }
    })

@app.route('/api/recommendation-chat/start', methods=['POST'])
def start_recommendation_chat():
    """Démarrer une conversation de recommandation"""
    print("=== AI SERVICE - START RECOMMENDATION CHAT ===")
    print("Method:", request.method)
    print("Headers:", dict(request.headers))
    # Migration progressive: rediriger vers l’endpoint unifié
    return redirect('/api/unified-chat/one-shot', code=307)

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
    """Démarrer une conversation d'administration (Pack)"""
    try:
        from chatbot.unified_pack_chatbot import UnifiedPackChatbot
        
        import uuid
        session_id = str(uuid.uuid4())
        
        chatbot = UnifiedPackChatbot()
        chatbot_sessions[session_id] = chatbot
        
        response = chatbot.get_welcome_message()
        response['session_id'] = session_id
        
        return jsonify(response)
    except Exception as e:
        return jsonify({
            "error": "Erreur lors du démarrage de la conversation admin",
            "details": str(e)
        }), 500

@app.route('/api/admin-chat', methods=['POST'])
def continue_admin_chat():
    """Continuer une conversation d'administration (Pack)"""
    try:
        from chatbot.unified_pack_chatbot import UnifiedPackChatbot
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
            
        message = data.get('message', '')
        session_id = data.get('session_id', '')
        
        if not session_id or session_id not in chatbot_sessions:
            # Créer une nouvelle session
            import uuid
            session_id = str(uuid.uuid4())
            from chatbot.unified_pack_chatbot import UnifiedPackChatbot
            chatbot_sessions[session_id] = UnifiedPackChatbot()
            
        auth_token = request.headers.get('Authorization')
        
        chatbot = chatbot_sessions[session_id]
        response = chatbot.process_message(message, auth_token)
        response['session_id'] = session_id
        
        return jsonify(response)
    except Exception as e:
        return jsonify({
            "error": "Erreur lors du traitement du message admin",
            "details": str(e)
        }), 500

@app.route('/api/garantie-chat/start', methods=['POST'])
def start_garantie_chat():
    """Démarrer une conversation de création de garantie"""
    try:
        from chatbot.unified_garantie_chatbot import UnifiedGarantieChatbot
        
        # Générer un ID de session unique
        import uuid
        session_id = str(uuid.uuid4())
        
        # Créer et stocker le chatbot pour cette session
        chatbot = UnifiedGarantieChatbot()
        chatbot_sessions[session_id] = chatbot
        
        response = chatbot.get_welcome_message()
        response['session_id'] = session_id
        
        return jsonify(response)
    except Exception as e:
        return jsonify({
            "error": "Erreur lors du démarrage de la conversation garantie",
            "details": str(e)
        }), 500

@app.route('/api/garantie-chat', methods=['POST'])
def continue_garantie_chat():
    """Continuer une conversation de création de garantie"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
            
        message = data.get('message', '')
        session_id = data.get('session_id', '')
        
        if not session_id or session_id not in chatbot_sessions:
            # Si pas de session valide, en créer une nouvelle mais on traite quand même le message
            import uuid
            session_id = str(uuid.uuid4())
            from chatbot.unified_garantie_chatbot import UnifiedGarantieChatbot
            chatbot_sessions[session_id] = UnifiedGarantieChatbot()
        
        auth_token = request.headers.get('Authorization')
        
        # Récupérer le chatbot existant pour cette session
        chatbot = chatbot_sessions[session_id]
        response = chatbot.process_message(message, auth_token)
        response['session_id'] = session_id
        
        return jsonify(response)
    except Exception as e:
        return jsonify({
            "error": "Erreur lors du traitement du message garantie",
            "details": str(e)
        }), 500

@app.route('/api/unified-chat/one-shot', methods=['POST'])
def unified_one_shot():
    """Démarrer une conversation one-shot avec le chatbot unifié"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
        user_input = data.get('user_input', '')
        if not user_input:
            return jsonify({"error": "Le champ 'user_input' est requis"}), 400
        auth_token = request.headers.get('Authorization')
        bot = create_unified_chatbot()
        result = bot.process(user_input, auth_token)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": "Erreur lors du traitement unifié", "details": str(e)}), 500

# Routes pour les services Google API
# Routes pour les services d'assurance NLP
@app.route('/api/assurance/one-shot', methods=['POST'])
def process_one_shot_request():
    """Traite une demande utilisateur en mode ONE-SHOT direct"""
    print("=== ONE-SHOT PROCESSOR ===")
    print("Method:", request.method)
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
        
        user_input = data.get('user_input', '')
        if not user_input:
            return jsonify({"error": "Le champ 'user_input' est requis"}), 400
        
        print("User input:", user_input)
        
        # Traiter la demande avec le processeur one-shot
        result = one_shot_processor.process(user_input)
        
        print("One-shot processing completed successfully")
        print("Action detected:", result.get('action'))
        print("Data keys:", list(result.get('data', {}).keys()))
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in one-shot processing: {e}")
        return jsonify({
            "error": "Erreur lors du traitement one-shot",
            "details": str(e)
        }), 500

@app.route('/api/assurance/nlp', methods=['POST'])
def process_assurance_request():
    """Traiter une demande utilisateur en langage naturel pour l'assurance"""
    print("=== ASSURANCE NLP SERVICE ===")
    print("Method:", request.method)
    print("Headers:", dict(request.headers))
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
        
        user_input = data.get('user_input', '')
        if not user_input:
            return jsonify({"error": "Le champ 'user_input' est requis"}), 400
        
        print("User input:", user_input)
        
        # Traiter la demande avec le service NLP
        result = assurance_nlp_service.analyze_request(user_input)
        
        # Si valide, envoyer la requête à GestionProduit
        if result.get("validation", {}).get("isValid"):
            auth_token = request.headers.get('Authorization')
            action = result.get("action")
            data = result.get("data", {})
            
            integration_response = None
            if action == "CREATE_PRODUIT":
                integration_response = assurance_integration_service.create_produit(data, auth_token)
            elif action == "CREATE_GARANTIE":
                integration_response = assurance_integration_service.create_garantie(data, auth_token)
            elif action == "CREATE_PACK":
                integration_response = assurance_integration_service.create_pack(data, auth_token)
            elif action == "CREATE_PACK_WITH_GARANTIES":
                integration_response = assurance_integration_service.create_pack_with_garanties(data, auth_token)
            
            if integration_response:
                result["integration"] = integration_response
                if not integration_response.get("success"):
                    result["validation"]["isValid"] = False
                    result["validation"]["errors"].append("Erreur lors de l'enregistrement en base: " + str(integration_response.get("error")))
        
        print("NLP Analysis & Integration completed")

        return jsonify(result)
    except Exception as e:
        print("Error in process_assurance_request:", str(e))
        return jsonify({
            "error": "Erreur lors du traitement de la demande assurance",
            "details": str(e)
        }), 500

@app.route('/api/assurance/nlp/batch', methods=['POST'])
def process_assurance_requests_batch():
    """Traiter plusieurs demandes utilisateur en lot"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
        
        requests = data.get('requests', [])
        if not requests:
            return jsonify({"error": "La liste 'requests' est vide"}), 400
        
        results = []
        for req in requests:
            user_input = req.get('user_input', '')
            if user_input:
                result = assurance_nlp_service.analyze_request(user_input)
                results.append(result)
            else:
                results.append({
                    "error": "Champ 'user_input' manquant dans la requête",
                    "request": req
                })
        
        return jsonify({
            "results": results,
            "total_processed": len(results),
            "timestamp": enhanced_service.get_current_timestamp() if enhanced_service else None
        })
    except Exception as e:
        return jsonify({
            "error": "Erreur lors du traitement des demandes en lot",
            "details": str(e)
        }), 500

@app.route('/api/assurance/validate', methods=['POST'])
def validate_assurance_data():
    """Valider des données d'assurance structurées"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400
        
        action = data.get('action', '')
        assurance_data = data.get('data', {})
        
        if not action:
            return jsonify({"error": "L'action est requise pour la validation"}), 400
        
        # Valider selon le type d'action
        from models.assurance_entities import BusinessValidator, ActionType
        
        try:
            action_type = ActionType(action)
        except ValueError:
            return jsonify({"error": f"Action '{action}' non valide"}), 400
        
        validation_result = None
        
        if action_type == ActionType.CREATE_PRODUIT:
            from models.assurance_entities import Produit, TypeProduit, Statut
            produit = Produit(
                nomProduit=assurance_data.get('nomProduit', ''),
                description=assurance_data.get('description'),
                typeProduit=TypeProduit(assurance_data.get('typeProduit')) if assurance_data.get('typeProduit') else None,
                statut=Statut(assurance_data.get('statut')) if assurance_data.get('statut') else None
            )
            validation_result = BusinessValidator.validate_produit(produit)
        
        elif action_type == ActionType.CREATE_GARANTIE:
            from models.assurance_entities import Garantie, TypeGarantie, Statut, TypeMontant, TypePlafond
            garantie = Garantie(
                nomGarantie=assurance_data.get('nomGarantie', ''),
                description=assurance_data.get('description'),
                typeGarantie=TypeGarantie(assurance_data.get('typeGarantie')) if assurance_data.get('typeGarantie') else None,
                statut=Statut(assurance_data.get('statut')) if assurance_data.get('statut') else None,
                tauxRemboursement=assurance_data.get('tauxRemboursement'),
                typeMontant=TypeMontant(assurance_data.get('typeMontant')) if assurance_data.get('typeMontant') else None,
                typePlafond=TypePlafond(assurance_data.get('typePlafond')) if assurance_data.get('typePlafond') else None,
                plafondAnnuel=assurance_data.get('plafondAnnuel'),
                plafondMensuel=assurance_data.get('plafondMensuel'),
                plafondParActe=assurance_data.get('plafondParActe'),
                franchise=assurance_data.get('franchise'),
                dureeMinContrat=assurance_data.get('dureeMinContrat'),
                dureeMaxContrat=assurance_data.get('dureeMaxContrat'),
                resiliableAnnuellement=assurance_data.get('resiliableAnnuellement')
            )
            validation_result = BusinessValidator.validate_garantie(garantie)
        
        elif action_type == ActionType.CREATE_PACK:
            from models.assurance_entities import Pack, TypeClients, CouvertureGeographique, NiveauCouverture, Statut
            pack = Pack(
                nomPack=assurance_data.get('nomPack', ''),
                description=assurance_data.get('description'),
                produitId=assurance_data.get('produitId'),
                ageMinimum=assurance_data.get('ageMinimum'),
                ageMaximum=assurance_data.get('ageMaximum'),
                typeClients=TypeClients(assurance_data.get('typeClients')) if assurance_data.get('typeClients') else None,
                ancienneteContratMois=assurance_data.get('ancienneteContratMois'),
                couvertureGeographique=CouvertureGeographique(assurance_data.get('couvertureGeographique')) if assurance_data.get('couvertureGeographique') else None,
                prixMensuel=assurance_data.get('prixMensuel'),
                dureeMinContrat=assurance_data.get('dureeMinContrat'),
                dureeMaxContrat=assurance_data.get('dureeMaxContrat'),
                niveauCouverture=NiveauCouverture(assurance_data.get('niveauCouverture')) if assurance_data.get('niveauCouverture') else None,
                statut=Statut(assurance_data.get('statut')) if assurance_data.get('statut') else None
            )
            validation_result = BusinessValidator.validate_pack(pack)
        
        else:
            return jsonify({"error": f"Action '{action}' non supportée pour la validation"}), 400
        
        return jsonify(validation_result.to_dict())
        
    except Exception as e:
        return jsonify({
            "error": "Erreur lors de la validation des données assurance",
            "details": str(e)
        }), 500

@app.route('/api/assurance/examples', methods=['GET'])
def get_assurance_examples():
    """Obtenir des exemples de demandes et leurs transformations"""
    examples = [
        {
            "user_input": "Créer un produit d'assurance santé nommé 'Assurance Santé Plus', avec une description 'Couverture médicale complète pour particuliers et familles', de type SANTE et avec statut ACTIF",
            "expected_action": "CREATE_PRODUIT",
            "description": "Exemple de création de produit santé"
        },
        {
            "user_input": "Créer une garantie hospitalisation nommée 'Garantie Hospitalisation Premium', avec description 'Couvre les frais d'hospitalisation lourds', statut ACTIF, type HOSPITALISATION, taux de remboursement 0.9, type montant FRAIS_REELS, type plafond ANNUEL, plafond annuel 20000, franchise 100",
            "expected_action": "CREATE_GARANTIE",
            "description": "Exemple de création de garantie hospitalisation"
        },
        {
            "user_input": "Créer un pack nommé 'Pack Santé Famille Premium', description 'Pack complet pour familles avec couverture élevée', lié au produit SANTE, pour âge minimum 25 et maximum 65 ans, type clients FAMILLE, couverture géographique NATIONAL, prix mensuel 150",
            "expected_action": "CREATE_PACK",
            "description": "Exemple de création de pack famille"
        },
        {
            "user_input": "Créer un pack santé nommé 'Pack Santé Gold Famille', description 'Couverture maximale pour familles', produit SANTE, âge 30 à 70 ans, type client FAMILLE, couverture INTERNATIONAL, prix mensuel 200, avec garantie hospitalisation obligatoire (taux 0.9, plafond 30000) et garantie dentaire optionnelle (supplément 25)",
            "expected_action": "CREATE_PACK_WITH_GARANTIES",
            "description": "Exemple de pack complet avec garanties"
        }
    ]
    
    return jsonify({
        "examples": examples,
        "total_examples": len(examples)
    })

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
