from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
# Ajouter le chemin du projet
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from chatbot.recommendation_chatbot import RecommendationChatbot
from chatbot.chatbot_engine import ChatbotEngine
from chatbot.session_manager import session_manager

app = Flask(__name__)
CORS(app)

def get_session_id():
    """Extrait le session_id de la requête (header ou JSON)."""
    # Chercher dans les headers (X-Session-Id) ou le corps de la requête
    session_id = request.headers.get('X-Session-Id')
    if not session_id:
        data = request.get_json(silent=True) or {}
        session_id = data.get('session_id', 'default_user')
    return session_id

# Initialiser les chatbots
recommendation_chatbot = RecommendationChatbot()
admin_chatbot = ChatbotEngine()

@app.route('/api/recommendation-chat/start', methods=['POST'])
def start_recommendation_chat():
    """Démarre une nouvelle conversation de recommandation."""
    try:
        response = recommendation_chatbot.get_welcome_message()
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendation-chat', methods=['POST'])
def recommendation_chat():
    """Traite un message dans la conversation de recommandation."""
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('conversation_history', [])
        client_id = data.get('client_id', '')
        response = recommendation_chatbot.process_message(message, history, client_id)
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin-chat/start', methods=['POST'])
def start_admin_chat():
    """Démarre une nouvelle conversation d'administration."""
    try:
        session_id = get_session_id()
        # Réinitialiser la session actuelle pour un nouveau départ
        session_manager.reset_session(session_id)
        response = admin_chatbot.process_message('', [], mode='creation', session_id=session_id)
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin-chat/reset', methods=['POST'])
def reset_admin_chat():
    """Réinitialise explicitement la session d'administration."""
    try:
        session_id = get_session_id()
        session_manager.reset_session(session_id)
        return jsonify({'status': 'success', 'message': f'Session {session_id} réinitialisée.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin-chat', methods=['POST'])
def admin_chat():
    """Traite un message dans la conversation d'administration."""
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('conversation_history', [])
        mode = data.get('mode', 'creation')
        session_id = get_session_id()
        
        response = admin_chatbot.process_message(message, history, mode, session_id=session_id)
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifie l'état du service."""
    return jsonify({
        'service': 'ai-service',
        'status': 'UP',
        'services': {
            'recommendation': 'active',
            'admin': 'active'
        }
    })
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    print(f"Demarrage du service AI sur le port {port}")
    print("Chatbot de recommandation: ACTIF")
    print("Chatbot d'administration: ACTIF")
    app.run(host='0.0.0.0', port=port, debug=debug)