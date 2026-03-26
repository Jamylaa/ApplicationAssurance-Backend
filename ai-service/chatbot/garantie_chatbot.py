import os
import requests
from typing import Dict, List, Any
from .base_chatbot import BaseChatbot

class GarantieChatbot(BaseChatbot):
    """ Chatbot de création de garanties.
    Hérite de BaseChatbot pour une gestion d'état et un parsing robustes.
    """
    GARANTIE_FIELDS = [
        {
            "key": "nom_garantie",
            "question": "Quel est le nom de la garantie ?",
            "type": "text",
            "required": True,
            "validation": lambda x: len(x.strip()) >= 3,
            "error_message": "Le nom doit contenir au moins 3 caractères.",
        },
        {
            "key": "description",
            "question": "Quelle est la description de la garantie ?",
            "type": "text",
            "required": True,
            "validation": lambda x: len(x.strip()) >= 10,
            "error_message": "La description doit contenir au moins 10 caractères.",
        },
        {
            "key": "type_garantie",
            "question": "Quel est le type de garantie ? (MALADIE_LEGERE, MALADIE_CHRONIQUE, OPHTALMOLOGIE, DENTAIRE, HOSPITALISATION, MATERNITE)",
            "type": "choice",
            "choices": ["MALADIE_LEGERE", "MALADIE_CHRONIQUE", "OPHTALMOLOGIE", "DENTAIRE", "HOSPITALISATION", "MATERNITE"],
            "required": True,
            "validation": lambda x: x in ["MALADIE_LEGERE", "MALADIE_CHRONIQUE", "OPHTALMOLOGIE", "DENTAIRE", "HOSPITALISATION", "MATERNITE"],
            "error_message": "Veuillez choisir parmi les types proposés.",
        },
        {
            "key": "plafond_annuel",
            "question": "Quel est le plafond annuel (en DT) ?",
            "type": "float",
            "required": True,
            "validation": lambda x: x > 0,
            "error_message": "Le plafond doit être un nombre positif.",
        },
        {
            "key": "taux_couverture",
            "question": "Quel est le taux de couverture (0-100%) ?",
            "type": "float",
            "required": True,
            "validation": lambda x: 0 <= x <= 100,
            "error_message": "Le taux de couverture doit être entre 0 et 100.",
        },
        {
            "key": "actif",
            "question": "La garantie doit-elle être active ? (Oui/Non)",
            "type": "boolean",
            "required": True,
            "validation": lambda x: isinstance(x, bool),
            "error_message": "Veuillez répondre par 'Oui' ou 'Non'.",
        }
    ]
    
    def __init__(self):
        service_url = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:9093")
        super().__init__(self.GARANTIE_FIELDS, service_url, "Garantie")

    def _perform_create(self) -> Dict[str, Any]:
        """Appel à l'API pour créer la Garantie"""
        payload = {
            "nomGarantie": self.collected_data["nom_garantie"],
            "description": self.collected_data["description"],
            "typeGarantie": self.collected_data["type_garantie"],
            "plafondAnnuel": float(self.collected_data["plafond_annuel"]),
            "tauxCouverture": float(self.collected_data["taux_couverture"]),
            "actif": bool(self.collected_data["actif"])
        }
        
        try:
            response = requests.post(f"{self.service_url}/api/garanties", json=payload, timeout=10)
            return self._handle_api_response(response)
        except Exception as e:
            return {"response": f"❌ Erreur de connexion : {str(e)}", "is_complete": False}
