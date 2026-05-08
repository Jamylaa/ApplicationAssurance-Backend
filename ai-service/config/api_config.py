"""
Configuration des API externes pour le service AI
"""

import os
from typing import Optional

class APIConfig:
    """Classe de configuration pour les API externes"""
    
    def __init__(self):
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        self.product_service_url = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:9093")
        self.recommendation_service_url = os.getenv("RECOMMENDATION_SERVICE_URL", "http://localhost:9095")
        self.flask_port = int(os.getenv("FLASK_PORT", "5000"))
        self.flask_debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    
    def get_google_api_key(self) -> Optional[str]:
        """Récupère la clé API Google"""
        return self.google_api_key
    
    def is_google_api_configured(self) -> bool:
        """Vérifie si la clé API Google est configurée"""
        return bool(self.google_api_key and len(self.google_api_key.strip()) > 0)
    
    def get_service_urls(self) -> dict:
        """Retourne les URLs des services"""
        return {
            "product_service": self.product_service_url,
            "recommendation_service": self.recommendation_service_url
        }
    
    def get_flask_config(self) -> dict:
        """Retourne la configuration Flask"""
        return {
            "port": self.flask_port,
            "debug": self.flask_debug
        }
    
    def validate_config(self) -> dict:
        """Valide la configuration et retourne les erreurs"""
        errors = []
        
        if not self.google_api_key:
            errors.append("GOOGLE_API_KEY n'est pas configurée")
        elif len(self.google_api_key.strip()) < 10:
            errors.append("GOOGLE_API_KEY semble invalide (trop courte)")
        
        if not self.product_service_url:
            errors.append("PRODUCT_SERVICE_URL n'est pas configurée")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }

# Instance globale de configuration
api_config = APIConfig()
