"""
Chatbot Engine - Distributeur de sessions
Refonte pour déléguer aux chatbots spécialisés (Produit, Pack, Garantie)
via le SessionManager pour éviter les décalages de champs.
"""

from typing import Optional, Dict, Any
from .session_manager import session_manager
from .recommendation_chatbot import RecommendationChatbot

class ChatbotEngine:
    """
    Moteur chatbot qui délègue aux chatbots spécialisés via SessionManager.
    Assure la continuité de l'état sans relecture d'historique.
    """
    
    INTENT_CHOOSE = {
        "key": "admin_intent",
        "question_fr": "Que souhaitez-vous créer aujourd'hui ? (Garantie, Produit ou Pack)",
        "type": "choice",
        "choices": ["Garantie", "Produit", "Pack"],
        "required": True
    }

    def __init__(self):
        # Le mode recommandation peut être partagé ou instancié par session si besoin
        self.recommendation_chatbot = RecommendationChatbot()

    def process_message(self, message: str, history: list, mode: str, session_id: str = "default") -> dict:
        """
        Point d'entrée principal qui dispatche vers le bon chatbot.
        """
        print(f"DEBUG: Engine - Session: {session_id}, Message: '{message}', Mode: {mode}")
        
        # 1. Mode Recommandation (Client)
        if mode == "recommendation":
            return self.recommendation_chatbot.process_message(message, history)

        # 2. Commandes globales (Annuler / Quitter)
        msg_clean = message.lower().strip()
        if msg_clean in ["annuler", "quitter", "exit", "reset", "stop"]:
            session_manager.reset_session(session_id)
            return {
                "response": "D'accord, j'ai annulé l'opération en cours. " + str(self.INTENT_CHOOSE["question_fr"]),
                "state": "welcome",
                "is_complete": False,
                "next_field": self.INTENT_CHOOSE["key"]
            }

        # 3. Récupérer l'intent actif s'il existe
        active_intent = session_manager.get_active_intent(session_id)
        
        # 4. Mode Administration / Création
        # Si on a un intent actif, on continue avec, sinon on tente de le détecter
        intent = active_intent if active_intent else self._detect_intent(message, history)
        
        if not intent:
            # Si aucun intent n'est détecté et qu'on n'est pas déjà dans un flux, 
            # proposer le choix
            return {
                "response": "Bonjour ! " + str(self.INTENT_CHOOSE["question_fr"]),
                "state": "welcome",
                "is_complete": False,
                "next_field": self.INTENT_CHOOSE["key"]
            }

        # Récupérer le chatbot spécifique pour cette session et cet intent
        chatbot = session_manager.get_chatbot(session_id, intent)
        
        if not chatbot:
             return {"response": "Désolé, je ne gère pas encore ce type de création.", "is_complete": False}

        # Commencer le flux si on vient juste de choisir l'intent ou si le message correspond au choix
        choices = self.INTENT_CHOOSE.get("choices", [])
        if not active_intent and msg_clean in [c.lower() for c in choices]:
            # Si c'est le tout début pour cet intent, renvoyer le message de bienvenue du chatbot
            return chatbot.get_welcome_message()

        # Traiter le message avec le chatbot spécialisé (qui garde son propre état)
        response = chatbot.process_message(message)
        
        # Injecter l'intent dans la réponse pour info
        if isinstance(response, dict):
            if "collected_data" not in response:
                response["collected_data"] = {}
            response["collected_data"]["admin_intent"] = intent
            
        return response

    def _detect_intent(self, message: str, history: list) -> Optional[str]:
        """
        Détecte l'intent actuel. 
        Cherche d'abord dans le message, puis dans l'historique récent.
        """
        msg_lower = message.lower().strip()
        choices = self.INTENT_CHOOSE.get("choices", [])
        
        # 1. Détection directe dans le message actuel
        for choice in choices:
            if choice.lower() in msg_lower:
                return choice
        
        # 2. Détection par le contexte de l'historique
        # Si le bot a demandé "Que souhaitez-vous créer" juste avant
        if history and history[-1].get("role") == "bot":
            last_bot_msg = history[-1].get("content", "")
            if "Que souhaitez-vous créer" in last_bot_msg:
                 # On cherche si l'utilisateur a répondu par un des choix valides
                 for choice in choices:
                    if choice.lower() == msg_lower:
                        return choice
        
        # 3. Détection par persistence (si on a déjà commencé un flux)
        # On remonte l'historique pour trouver le dernier choix d'intent
        for msg in reversed(history):
            if msg.get("role") == "user":
                content = msg.get("content", "").lower().strip()
                for choice in choices:
                    if choice.lower() == content:
                        return choice
        
        return None