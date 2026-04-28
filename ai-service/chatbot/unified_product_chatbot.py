import os
import requests
from typing import Dict, List, Any
from .base_chatbot import BaseChatbot

class UnifiedProductChatbot(BaseChatbot):
    """
    Chatbot unifié pour la création ET configuration de produits d'assurance.
    Permet de créer un produit et de le configurer en une seule conversation.
    """
    
    def __init__(self):
        # Définir les champs pour la création et la configuration
        fields = [
            {
                "key": "action_type",
                "question": "Que souhaitez-vous faire ? (creer / configurer)",
                "type": "choice",
                "choices": ["creer", "configurer"],
                "required": True,
                "validation": lambda x: x in ["creer", "configurer"],
                "error_message": "Veuillez choisir entre 'creer' ou 'configurer'."
            },
            {
                "key": "product_id",
                "question": "Quel est l'ID du produit ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) >= 3,
                "error_message": "L'ID du produit doit contenir au moins 3 caractères.",
                "condition": lambda data: data.get("action_type") == "configurer"
            },
            {
                "key": "nom_produit",
                "question": "Quel est le nom du produit ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) > 0,
                "error_message": "Le nom du produit ne peut pas être vide.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "description",
                "question": "Quelle est la description du produit ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) > 10,
                "error_message": "La description doit contenir au moins 10 caractères.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "type_produit",
                "question": "Quel est le type de produit ? (Sante / Habitation / Auto / Epargne / vie)",
                "type": "choice",
                "choices": ["Sante", "Habitation", "Auto", "Epargne", "vie"],
                "required": True,
                "validation": lambda x: x in ["Sante", "Habitation", "Auto", "Epargne", "vie"],
                "error_message": "Veuillez choisir parmi: Sante, Habitation, Auto, Epargne, vie.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "statut",
                "question": "Quel est le statut du produit ? (ACTIF / INACTIF / EN_ATTENTE / SUSPENDU / EXPIRE / RESLIE)",
                "type": "choice",
                "choices": ["ACTIF", "INACTIF", "EN_ATTENTE", "SUSPENDU", "EXPIRE", "RESLIE"],
                "required": True,
                "validation": lambda x: x in ["ACTIF", "INACTIF", "EN_ATTENTE", "SUSPENDU", "EXPIRE", "RESLIE"],
                "error_message": "Veuillez choisir parmi: ACTIF, INACTIF, EN_ATTENTE, SUSPENDU, EXPIRE, RESLIE."
            },
            {
                "key": "configuration_type",
                "question": "Quel type de configuration ? (statut / conditions_eligibilite / complet)",
                "type": "choice",
                "choices": ["statut", "conditions_eligibilite", "complet"],
                "required": True,
                "validation": lambda x: x in ["statut", "conditions_eligibilite", "complet"],
                "error_message": "Veuillez choisir parmi: statut, conditions_eligibilite, complet.",
                "condition": lambda data: data.get("action_type") == "configurer"
            },
            {
                "key": "new_statut",
                "question": "Quel est le nouveau statut ? (ACTIF / INACTIF / EN_ATTENTE / SUSPENDU / EXPIRE / RESLIE)",
                "type": "choice",
                "choices": ["ACTIF", "INACTIF", "EN_ATTENTE", "SUSPENDU", "EXPIRE", "RESLIE"],
                "required": True,
                "validation": lambda x: x in ["ACTIF", "INACTIF", "EN_ATTENTE", "SUSPENDU", "EXPIRE", "RESLIE"],
                "error_message": "Veuillez choisir parmi: ACTIF, INACTIF, EN_ATTENTE, SUSPENDU, EXPIRE, RESLIE.",
                "condition": lambda data: data.get("configuration_type") == "statut"
            },
            {
                "key": "add_condition_eligibilite",
                "question": "Voulez-vous ajouter une condition d'éligibilité ? (Oui/Non)",
                "type": "boolean",
                "required": True,
                "validation": lambda x: isinstance(x, bool),
                "error_message": "Veuillez répondre par 'Oui' ou 'Non'.",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["conditions_eligibilite", "complet"]
            }
        ]
        
        # Champs pour les conditions d'éligibilité
        condition_fields = [
            {
                "key": "age_minimum",
                "question": "Quel est l'âge minimum autorisé ?",
                "type": "int",
                "required": True,
                "validation": lambda x: 0 <= x <= 120,
                "error_message": "L'âge minimum doit être entre 0 et 120."
            },
            {
                "key": "age_maximum",
                "question": "Quel est l'âge maximum autorisé ?",
                "type": "int",
                "required": True,
                "validation": lambda x, data: x > data.get("age_minimum", 0),
                "error_message": "L'âge maximum doit être supérieur à l'âge minimum.",
                "depends_on": "age_minimum"
            },
            {
                "key": "type_clients",
                "question": "Quels types de clients sont acceptés ? (INDIVIDUEL / FAMILLE / ENFANT / SENIOR / ENTREPRISE / ETUDIANT) - Séparez par des virgules",
                "type": "list",
                "required": True,
                "validation": lambda x: all(client in ["INDIVIDUEL", "FAMILLE", "ENFANT", "SENIOR", "ENTREPRISE", "ETUDIANT"] for client in x),
                "error_message": "Types valides: INDIVIDUEL, FAMILLE, ENFANT, SENIOR, ENTREPRISE, ETUDIANT."
            },
            {
                "key": "anciennete_contrat_mois",
                "question": "Quelle est l'ancienneté de contrat minimale requise (en mois) ?",
                "type": "int",
                "required": True,
                "validation": lambda x: x >= 0,
                "error_message": "L'ancienneté doit être un nombre positif."
            },
            {
                "key": "couverture_geographique",
                "question": "Quelle est la couverture géographique ? (LOCAL / NATIONAL / INTERNATIONAL / UE / MAGHREB)",
                "type": "choice",
                "choices": ["LOCAL", "NATIONAL", "INTERNATIONAL", "UE", "MAGHREB"],
                "required": True,
                "validation": lambda x: x in ["LOCAL", "NATIONAL", "INTERNATIONAL", "UE", "MAGHREB"],
                "error_message": "Veuillez choisir parmi: LOCAL, NATIONAL, INTERNATIONAL, UE, MAGHREB."
            }
        ]
        
        # Combiner tous les champs
        all_fields = fields + condition_fields
        
        service_url = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:9093")
        super().__init__(all_fields, service_url, "Produit")
        
        # Stocker les champs conditionnels séparément
        self.condition_fields = condition_fields
    
    def _should_ask_field(self, field_key: str, data: Dict) -> bool:
        """Détermine si un champ doit être demandé selon les conditions"""
        field = next((f for f in self.fields if f["key"] == field_key), None)
        if not field:
            return False
        
        # Si le champ a une condition, l'évaluer
        if "condition" in field:
            return field["condition"](data)
        
        return True
    
    def _get_next_field(self) -> Dict:
        """Obtient le prochain champ à demander selon les conditions"""
        data = self.collected_data
        
        # Parcourir les champs dans l'ordre
        for i, field in enumerate(self.fields):
            if i <= self.current_field_index:
                continue
                
            # Vérifier si ce champ doit être demandé
            if self._should_ask_field(field["key"], data):
                self.current_field_index = i
                return field
        
        return None
    
    def _handle_collecting(self, message: str) -> Dict[str, Any]:
        """ Gère la collecte des données avec champs conditionnels """
        data = self.collected_data
        current_field = self._get_current_field()
        
        if not current_field:
            return self._handle_welcome(message)
        
        field_key = current_field["key"]
        
        # Vérifier si ce champ doit être traité
        if not self._should_ask_field(field_key, data):
            # Passer au champ suivant
            self.current_field_index += 1
            return self._handle_collecting(message)
        
        # Parser et valider le message
        parsed_value = self._smart_parse(message, current_field)
        
        if parsed_value is None:
            return {
                "response": current_field["error_message"],
                "is_complete": False,
                "field": field_key
            }
        
        # Valider la valeur
        if not self._validate_field(parsed_value, current_field):
            return {
                "response": current_field["error_message"],
                "is_complete": False,
                "field": field_key
            }
        
        # Stocker la valeur
        data[field_key] = parsed_value
        
        # Passer au champ suivant
        self.current_field_index += 1
        
        # Vérifier si la collecte est terminée
        next_field = self._get_next_field()
        if not next_field:
            return self._handle_validation("")
        
        return {
            "response": next_field["question"],
            "is_complete": False,
            "field": next_field["key"]
        }
    
    def _handle_validation(self, message: str) -> Dict[str, Any]:
        """Gère la validation et la création/configuration"""
        data = self.collected_data
        action_type = data.get("action_type")
        
        try:
            if action_type == "creer":
                return self._create_product(data)
            elif action_type == "configurer":
                return self._configure_product(data)
            else:
                return {
                    "response": "Type d'action non valide.",
                    "is_complete": False
                }
        except Exception as e:
            return {
                "response": f"Erreur lors de l'opération: {str(e)}",
                "is_complete": False
            }
    
    def _create_product(self, data: Dict) -> Dict[str, Any]:
        """Crée un nouveau produit"""
        product_data = {
            "nomProduit": data["nom_produit"],
            "description": data["description"],
            "typeProduit": data["type_produit"],
            "statut": data["statut"]
        }
        
        # Ajouter les conditions d'éligibilité si présentes
        if data.get("add_condition_eligibilite"):
            product_data.update({
                "ageMinimum": data.get("age_minimum"),
                "ageMaximum": data.get("age_maximum"),
                "typeClients": data.get("type_clients", []),
                "ancienneteContratMois": data.get("anciennete_contrat_mois"),
                "couvertureGeographique": data.get("couverture_geographique")
            })
        
        response = requests.post(f"{self.service_url}/api/produits", json=product_data, timeout=10)
        
        if response.status_code == 201:
            product = response.json()
            return {
                "response": f"Produit '{product['nomProduit']}' créé avec succès ! ID: {product['idProduit']}",
                "is_complete": True,
                "data": product
            }
        else:
            return {
                "response": f"Erreur lors de la création: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _configure_product(self, data: Dict) -> Dict[str, Any]:
        """Configure un produit existant"""
        product_id = data["product_id"]
        config_type = data["configuration_type"]
        
        if config_type == "statut":
            return self._update_product_statut(product_id, data["new_statut"])
        elif config_type in ["conditions_eligibilite", "complet"]:
            return self._update_product_conditions(product_id, data)
        else:
            return {
                "response": "Type de configuration non valide.",
                "is_complete": False
            }
    
    def _update_product_statut(self, product_id: str, new_statut: str) -> Dict[str, Any]:
        """Met à jour le statut d'un produit"""
        response = requests.patch(f"{self.service_url}/api/produits/{product_id}/desactiver", timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Statut du produit {product_id} mis à jour avec succès vers {new_statut}",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la mise à jour du statut: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _update_product_conditions(self, product_id: str, data: Dict) -> Dict[str, Any]:
        """Met à jour les conditions d'éligibilité d'un produit"""
        if not data.get("add_condition_eligibilite"):
            return {
                "response": "Aucune condition d'éligibilité à mettre à jour.",
                "is_complete": True
            }
        
        update_data = {
            "ageMinimum": data.get("age_minimum"),
            "ageMaximum": data.get("age_maximum"),
            "typeClients": data.get("type_clients", []),
            "ancienneteContratMois": data.get("anciennete_contrat_mois"),
            "couvertureGeographique": data.get("couverture_geographique")
        }
        
        response = requests.put(f"{self.service_url}/api/produits/{product_id}", json=update_data, timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Conditions d'éligibilité du produit {product_id} mises à jour avec succès",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la mise à jour des conditions: {response.status_code} - {response.text}",
                "is_complete": False
            }
