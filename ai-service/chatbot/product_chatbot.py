import os
import requests
from typing import Dict, List, Any
from .base_chatbot import BaseChatbot

class ProductChatbot(BaseChatbot):
    """
    Chatbot de création de produits d'assurance.
    Hérite de BaseChatbot pour une gestion d'état et un parsing robustes.
    """
    
    PRODUCT_FIELDS = [
        {
            "key": "nom_produit",
            "question": "Quel est le nom du produit ?",
            "type": "text",
            "required": True,
            "validation": lambda x: len(x.strip()) > 0,
            "error_message": "Le nom du produit ne peut pas être vide."
        },
        {
            "key": "description",
            "question": "Quelle est la description du produit ?",
            "type": "text",
            "required": True,
            "validation": lambda x: len(x.strip()) > 10,
            "error_message": "La description doit contenir au moins 10 caractères."
        },
        {
            "key": "garanties_ids",
            "question": "Quels sont les IDs des garanties (séparés par des virgules) ?",
            "type": "list",
            "required": True,
            "validation": lambda x: len(x) > 0,
            "error_message": "Veuillez fournir au moins un ID de garantie valide."
        },
        {
            "key": "prix_base",
            "question": "Quel est le prix de base (en DT) ?",
            "type": "float",
            "required": True,
            "validation": lambda x: x > 0,
            "error_message": "Le prix doit être un nombre positif."
        },
        {
            "key": "age_min",
            "question": "Quel est l'âge minimum autorisé ?",
            "type": "int",
            "required": True,
            "validation": lambda x: 0 <= x <= 120,
            "error_message": "L'âge minimum doit être entre 0 et 120."
        },
        {
            "key": "age_max",
            "question": "Quel est l'âge maximum autorisé ?",
            "type": "int",
            "required": True,
            "validation": lambda x, data: x > data.get("age_min", 0),
            "error_message": "L'âge maximum doit être supérieur à l'âge minimum.",
            "depends_on": "age_min"
        },
        {
            "key": "maladie_chronique_autorisee",
            "question": "Le produit accepte-t-il les maladies chroniques ? (Oui/Non)",
            "type": "boolean",
            "required": True,
            "validation": lambda x: isinstance(x, bool),
            "error_message": "Veuillez répondre par 'Oui' ou 'Non'."
        },
        {
            "key": "diabetique_autorise",
            "question": "Le produit accepte-t-il les diabétiques ? (Oui/Non)",
            "type": "boolean",
            "required": True,
            "validation": lambda x: isinstance(x, bool),
            "error_message": "Veuillez répondre par 'Oui' ou 'Non'."
        },
        {
            "key": "actif",
            "question": "Le produit doit-il être actif ? (Oui/Non)",
            "type": "boolean",
            "required": True,
            "validation": lambda x: isinstance(x, bool),
            "error_message": "Veuillez répondre par 'Oui' ou 'Non'."
        }
    ]
    
    def __init__(self):
        service_url = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:9093")
        super().__init__(self.PRODUCT_FIELDS, service_url, "Produit")

    def _validate_all_data(self) -> List[str]:
        errors = []
        if "age_min" in self.collected_data and "age_max" in self.collected_data:
            if self.collected_data["age_min"] >= self.collected_data["age_max"]:
                errors.append("L'âge minimum doit être inférieur à l'âge maximum.")
        return errors

    def _perform_create(self) -> Dict[str, Any]:
        """Appel à l'API pour créer le Produit"""
        payload = {
            "nomProduit": self.collected_data["nom_produit"],
            "description": self.collected_data["description"],
            "garantiesIds": self.collected_data["garanties_ids"],
            "prixBase": float(self.collected_data["prix_base"]),
            "ageMin": int(self.collected_data["age_min"]),
            "ageMax": int(self.collected_data["age_max"]),
            "maladieChroniqueAutorisee": bool(self.collected_data["maladie_chronique_autorisee"]),
            "diabetiqueAutorise": bool(self.collected_data["diabetique_autorise"]),
            "actif": bool(self.collected_data["actif"])
        }
        
        try:
            response = requests.post(f"{self.service_url}/api/produits", json=payload, timeout=10)
            return self._handle_api_response(response)
        except Exception as e:
            return {"response": f"❌ Erreur de connexion : {str(e)}", "is_complete": False}
