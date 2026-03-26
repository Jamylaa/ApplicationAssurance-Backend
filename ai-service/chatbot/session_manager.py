import time
from typing import Dict, Any, Optional
from .product_chatbot import ProductChatbot
from .pack_chatbot import PackChatbot
from .garantie_chatbot import GarantieChatbot

class SessionManager:
    """
    Gère les sessions utilisateur pour le chatbot.
    Stocke les instances de chatbot par session_id pour maintenir l'état.
    """
    
    def __init__(self, session_timeout_seconds: int = 3600):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.session_timeout = session_timeout_seconds
    
    def get_chatbot(self, session_id: str, intent: str) -> Any:
        """
        Récupère ou crée une instance de chatbot pour une session et un intent donnés.
        """
        self._cleanup_sessions()
        
        # 1. Vérifier si on a déjà un intent actif pour cette session
        active_intent = self.get_active_intent(session_id)
        if active_intent and active_intent != intent:
            # Si un autre intent est déjà en cours, on privilégie l'actuel
            # à moins que l'utilisateur soit au début d'un nouveau choix (géré par l'engine)
            intent = active_intent
            
        session_key = f"{session_id}_{intent}"
        
        if session_key not in self.sessions:
            print(f"DEBUG: Création d'une nouvelle session pour {session_key}")
            chatbot = self._create_chatbot_instance(intent)
            if chatbot:
                self.sessions[session_key] = {
                    "instance": chatbot,
                    "last_access": time.time(),
                    "intent": intent
                }
                # Verrouiller cet intent comme étant l'actif pour cet utilisateur
                self.set_active_intent(session_id, intent)
            else:
                return None
        else:
            self.sessions[session_key]["last_access"] = time.time()
            
        return self.sessions[session_key]["instance"]
    
    def get_active_intent(self, session_id: str) -> Optional[str]:
        """Récupère l'intent actuellement verrouillé pour cette session"""
        # On cherche dans toutes les sessions de cet utilisateur s'il y en a une incomplète
        for key, data in self.sessions.items():
            if key.startswith(f"{session_id}_"):
                instance = data.get("instance")
                # Un chatbot est considéré comme actif s'il n'est pas dans l'état COMPLETED
                if instance and hasattr(instance, 'state') and str(instance.state.value) != "completed":
                    return data.get("intent")
        return None

    def set_active_intent(self, session_id: str, intent: str):
        """Définit l'intent actif (verrouillage)"""
        # Le verrouillage est implicite via get_active_intent qui vérifie l'état 'completed'
        pass

    def reset_session(self, session_id: str, intent: str = None):
        """Réinitialise une session spécifique ou toutes les sessions d'un utilisateur"""
        if intent:
            session_key = f"{session_id}_{intent}"
            if session_key in self.sessions:
                del self.sessions[session_key]
        else:
            keys_to_delete = [k for k in self.sessions.keys() if k.startswith(f"{session_id}_")]
            for k in keys_to_delete:
                del self.sessions[k]
    
    def _create_chatbot_instance(self, intent: str) -> Any:
        """Crée une instance de chatbot selon l'intent"""
        intent_lower = intent.lower()
        if intent_lower == "produit":
            return ProductChatbot()
        elif intent_lower == "pack":
            return PackChatbot()
        elif intent_lower == "garantie":
            return GarantieChatbot()
        else:
            return None
            
    def _cleanup_sessions(self):
        """Supprime les sessions expirées"""
        now = time.time()
        expired_keys = [
            k for k, v in self.sessions.items() 
            if now - v["last_access"] > self.session_timeout
        ]
        for k in expired_keys:
            del self.sessions[k]

# Singleton instance
session_manager = SessionManager()
