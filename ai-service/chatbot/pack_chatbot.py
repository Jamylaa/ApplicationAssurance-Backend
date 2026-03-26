import os
import requests
from typing import Dict, List, Any
from .base_chatbot import BaseChatbot, ChatState

class PackChatbot(BaseChatbot):
    """ Chatbot de création de packs d'assurance.
    Hérite de BaseChatbot pour une gestion d'état et un parsing robustes.
    """
    
    PACK_FIELDS = [
        {
            "key": "nom_pack",
            "question": "Quel est le nom du pack d'assurance ?",
            "type": "text",
            "required": True,
            "validation": lambda x: len(x.strip()) >= 3,
            "error_message": "Le nom du pack doit contenir au moins 3 caractères.",
        },
        {
            "key": "description",
            "question": "Quelle est la description du pack ?",
            "type": "text",
            "required": True,
            "validation": lambda x: len(x.strip()) >= 10,
            "error_message": "La description doit contenir au moins 10 caractères.",
        },
        {
            "key": "produits_ids",
            "question": "Quels sont les IDs des produits associés (séparés par des virgules) ?",
            "type": "list",
            "required": True,
            "validation": lambda x: len(x) > 0,
            "error_message": "Veuillez fournir au moins un ID de produit valide.",
        },
        {
            "key": "prix_mensuel",
            "question": "Quel est le prix mensuel du pack (en DT) ?",
            "type": "float",
            "required": True,
            "validation": lambda x: x > 0,
            "error_message": "Le prix mensuel doit être un nombre positif.",
        },
        {
            "key": "duree_min_contrat",
            "question": "Quelle est la durée minimale du contrat (en mois) ?",
            "type": "int",
            "required": True,
            "validation": lambda x: 1 <= x <= 120,
            "error_message": "La durée minimale doit être entre 1 et 120 mois.",
        },
        {
            "key": "duree_max_contrat",
            "question": "Quelle est la durée maximale du contrat (en mois) ?",
            "type": "int",
            "required": True,
            "validation": lambda x, data: x > data.get("duree_min_contrat", 0) and x <= 120,
            "error_message": "La durée maximale doit être supérieure à la durée minimale et ≤ 120 mois.",
            "depends_on": "duree_min_contrat",
        },
        {
            "key": "niveau_couverture",
            "question": "Quel est le niveau de couverture ? (basic / premium / gold)",
            "type": "choice",
            "required": True,
            "choices": ["basic", "premium", "gold"],
            "validation": lambda x: x in ["basic", "premium", "gold"],
            "error_message": "Le niveau doit être: basic, premium ou gold.",
        },
        {
            "key": "actif",
            "question": "Le pack doit-il être actif immédiatement ? (Oui/Non)",
            "type": "boolean",
            "required": True,
            "validation": lambda x: isinstance(x, bool),
            "error_message": "Veuillez répondre par 'Oui' ou 'Non'.",
        }
    ]
    
    def __init__(self):
        service_url = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:9093")
        super().__init__(self.PACK_FIELDS, service_url, "Pack")

    def _validate_all_data(self) -> List[str]:
        """Validations croisées spécifiques aux packs"""
        errors = []
        if "duree_min_contrat" in self.collected_data and "duree_max_contrat" in self.collected_data:
            if self.collected_data["duree_min_contrat"] >= self.collected_data["duree_max_contrat"]:
                errors.append("La durée minimale doit être inférieure à la durée maximale.")
        return errors

    def _perform_create(self) -> Dict[str, Any]:
        """Appel à l'API pour créer le Pack"""
        payload = {
            "nomPack": self.collected_data["nom_pack"],
            "description": self.collected_data["description"],
            "produitsIds": self.collected_data["produits_ids"],
            "prixMensuel": float(self.collected_data["prix_mensuel"]),
            "dureeMinContrat": int(self.collected_data["duree_min_contrat"]),
            "dureeMaxContrat": int(self.collected_data["duree_max_contrat"]),
            "niveauCouverture": self.collected_data["niveau_couverture"].lower(),
            "actif": bool(self.collected_data["actif"])
        }
        
        try:
            response = requests.post(f"{self.service_url}/api/packs", json=payload, timeout=10)
            return self._handle_api_response(response)
        except Exception as e:
            return {"response": f"❌ Erreur de connexion au service : {str(e)}", "is_complete": False}