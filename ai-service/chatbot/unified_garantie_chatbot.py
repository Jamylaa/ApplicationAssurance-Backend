import os
import requests
from typing import Dict, List, Any
from .base_chatbot import BaseChatbot

class UnifiedGarantieChatbot(BaseChatbot):
    """
    Chatbot unifié pour la création ET configuration de garanties d'assurance.
    Permet de créer une garantie et de la configurer en une seule conversation.
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
                "key": "garantie_id",
                "question": "Quel est l'ID de la garantie ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) >= 3,
                "error_message": "L'ID de la garantie doit contenir au moins 3 caractères.",
                "condition": lambda data: data.get("action_type") == "configurer"
            },
            {
                "key": "nom_garantie",
                "question": "Quel est le nom de la garantie ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) >= 3,
                "error_message": "Le nom doit contenir au moins 3 caractères.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "description",
                "question": "Quelle est la description de la garantie ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) >= 10,
                "error_message": "La description doit contenir au moins 10 caractères.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "type_garantie",
                "question": "Quel est le type de garantie ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) > 0,
                "error_message": "Le type de garantie ne peut pas être vide.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "statut",
                "question": "Quel est le statut de la garantie ? (ACTIF / INACTIF / EN_ATTENTE / SUSPENDU / EXPIRE / RESLIE)",
                "type": "choice",
                "choices": ["ACTIF", "INACTIF", "EN_ATTENTE", "SUSPENDU", "EXPIRE", "RESLIE"],
                "required": True,
                "validation": lambda x: x in ["ACTIF", "INACTIF", "EN_ATTENTE", "SUSPENDU", "EXPIRE", "RESLIE"],
                "error_message": "Veuillez choisir parmi: ACTIF, INACTIF, EN_ATTENTE, SUSPENDU, EXPIRE, RESLIE."
            },
            {
                "key": "configuration_type",
                "question": "Quel type de configuration ? (statut / parametres_financiers / parametres_contractuels / complet)",
                "type": "choice",
                "choices": ["statut", "parametres_financiers", "parametres_contractuels", "complet"],
                "required": True,
                "validation": lambda x: x in ["statut", "parametres_financiers", "parametres_contractuels", "complet"],
                "error_message": "Veuillez choisir parmi: statut, parametres_financiers, parametres_contractuels, complet.",
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
                "key": "niveau_couverture",
                "question": "Quel est le niveau de couverture ? (basic / premium / gold)",
                "type": "choice",
                "choices": ["basic", "premium", "gold"],
                "required": True,
                "validation": lambda x: x in ["basic", "premium", "gold"],
                "error_message": "Le niveau doit être: basic, premium ou gold.",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["parametres_financiers", "complet"]
            },
            {
                "key": "taux_remboursement",
                "question": "Quel est le taux de remboursement (0-100%) ?",
                "type": "float",
                "required": True,
                "validation": lambda x: 0 <= x <= 100,
                "error_message": "Le taux de remboursement doit être entre 0 et 100.",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["parametres_financiers", "complet"]
            },
            {
                "key": "type_montant",
                "question": "Quel est le type de montant ? (FORFAIT / FRAIS_REELS / TARIF_CONVENTIONNE)",
                "type": "choice",
                "choices": ["FORFAIT", "FRAIS_REELS", "TARIF_CONVENTIONNE"],
                "required": True,
                "validation": lambda x: x in ["FORFAIT", "FRAIS_REELS", "TARIF_CONVENTIONNE"],
                "error_message": "Veuillez choisir parmi: FORFAIT, FRAIS_REELS, TARIF_CONVENTIONNE.",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["parametres_financiers", "complet"]
            },
            {
                "key": "plafond_annuel",
                "question": "Quel est le plafond annuel (en DT) ?",
                "type": "float",
                "required": True,
                "validation": lambda x: x > 0,
                "error_message": "Le plafond annuel doit être un nombre positif.",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["parametres_financiers", "complet"]
            },
            {
                "key": "plafond_mensuel",
                "question": "Quel est le plafond mensuel (en DT) ?",
                "type": "float",
                "required": True,
                "validation": lambda x: x > 0,
                "error_message": "Le plafond mensuel doit être un nombre positif.",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["parametres_financiers", "complet"]
            },
            {
                "key": "plafond_par_acte",
                "question": "Quel est le plafond par acte (en DT) ?",
                "type": "float",
                "required": True,
                "validation": lambda x: x > 0,
                "error_message": "Le plafond par acte doit être un nombre positif.",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["parametres_financiers", "complet"]
            },
            {
                "key": "franchise",
                "question": "Quelle est la franchise (en DT) ?",
                "type": "float",
                "required": True,
                "validation": lambda x: x >= 0,
                "error_message": "La franchise doit être un nombre positif ou nul.",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["parametres_financiers", "complet"]
            },
            {
                "key": "cout_moyen_par_sinistre",
                "question": "Quel est le coût moyen par sinistre (en DT) ?",
                "type": "float",
                "required": True,
                "validation": lambda x: x >= 0,
                "error_message": "Le coût moyen par sinistre doit être un nombre positif ou nul.",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["parametres_financiers", "complet"]
            },
            {
                "key": "duree_min_contrat",
                "question": "Quelle est la durée minimale du contrat (en mois) ?",
                "type": "int",
                "required": True,
                "validation": lambda x: x >= 1,
                "error_message": "La durée minimale doit être d'au moins 1 mois.",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["parametres_contractuels", "complet"]
            },
            {
                "key": "duree_max_contrat",
                "question": "Quelle est la durée maximale du contrat (en mois) ?",
                "type": "int",
                "required": True,
                "validation": lambda x, data: x > data.get("duree_min_contrat", 0),
                "error_message": "La durée maximale doit être supérieure à la durée minimale.",
                "depends_on": "duree_min_contrat",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["parametres_contractuels", "complet"]
            },
            {
                "key": "resiliable_annuellement",
                "question": "Le contrat est-il résiliable annuellement ? (Oui/Non)",
                "type": "boolean",
                "required": True,
                "validation": lambda x: isinstance(x, bool),
                "error_message": "Veuillez répondre par 'Oui' ou 'Non'.",
                "condition": lambda data: data.get("action_type") == "creer" or data.get("configuration_type") in ["parametres_contractuels", "complet"]
            },
            {
                "key": "cree_par",
                "question": "Qui a créé cette garantie ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) > 0,
                "error_message": "Le créateur ne peut pas être vide.",
                "condition": lambda data: data.get("action_type") == "creer"
            }
        ]
        
        service_url = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:9093")
        super().__init__(fields, service_url, "Garantie")
    
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
        """Gère la collecte des données avec champs conditionnels"""
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
                return self._create_garantie(data)
            elif action_type == "configurer":
                return self._configure_garantie(data)
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
    
    def _create_garantie(self, data: Dict) -> Dict[str, Any]:
        """Crée une nouvelle garantie"""
        garantie_data = {
            "nomGarantie": data["nom_garantie"],
            "description": data["description"],
            "typeGarantie": data["type_garantie"],
            "statut": data["statut"],
            "niveauCouverture": data["niveau_couverture"],
            "tauxRemboursement": data["taux_remboursement"],
            "typeMontant": data["type_montant"],
            "plafondAnnuel": data["plafond_annuel"],
            "plafondMensuel": data["plafond_mensuel"],
            "plafondParActe": data["plafond_par_acte"],
            "franchise": data["franchise"],
            "coutMoyenParSinistre": data["cout_moyen_par_sinistre"],
            "dureeMinContrat": data["duree_min_contrat"],
            "dureeMaxContrat": data["duree_max_contrat"],
            "resiliableAnnuellement": data["resiliable_annuellement"],
            "creePar": data["cree_par"]
        }
        
        response = requests.post(f"{self.service_url}/api/garanties", json=garantie_data, timeout=10)
        
        if response.status_code == 201:
            garantie = response.json()
            return {
                "response": f"Garantie '{garantie['nomGarantie']}' créée avec succès ! ID: {garantie['idGarantie']}",
                "is_complete": True,
                "data": garantie
            }
        else:
            return {
                "response": f"Erreur lors de la création: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _configure_garantie(self, data: Dict) -> Dict[str, Any]:
        """Configure une garantie existante"""
        garantie_id = data["garantie_id"]
        config_type = data["configuration_type"]
        
        if config_type == "statut":
            return self._update_garantie_statut(garantie_id, data["new_statut"])
        elif config_type == "parametres_financiers":
            return self._update_garantie_financiers(garantie_id, data)
        elif config_type == "parametres_contractuels":
            return self._update_garantie_contractuels(garantie_id, data)
        elif config_type == "complet":
            return self._update_garantie_complet(garantie_id, data)
        else:
            return {
                "response": "Type de configuration non valide.",
                "is_complete": False
            }
    
    def _update_garantie_statut(self, garantie_id: str, new_statut: str) -> Dict[str, Any]:
        """Met à jour le statut d'une garantie"""
        response = requests.patch(f"{self.service_url}/api/garanties/{garantie_id}/desactiver", timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Statut de la garantie {garantie_id} mis à jour avec succès vers {new_statut}",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la mise à jour du statut: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _update_garantie_financiers(self, garantie_id: str, data: Dict) -> Dict[str, Any]:
        """Met à jour les paramètres financiers d'une garantie"""
        update_data = {
            "niveauCouverture": data.get("niveau_couverture"),
            "tauxRemboursement": data.get("taux_remboursement"),
            "typeMontant": data.get("type_montant"),
            "plafondAnnuel": data.get("plafond_annuel"),
            "plafondMensuel": data.get("plafond_mensuel"),
            "plafondParActe": data.get("plafond_par_acte"),
            "franchise": data.get("franchise"),
            "coutMoyenParSinistre": data.get("cout_moyen_par_sinistre")
        }
        
        response = requests.put(f"{self.service_url}/api/garanties/{garantie_id}", json=update_data, timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Paramètres financiers de la garantie {garantie_id} mis à jour avec succès",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la mise à jour des paramètres financiers: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _update_garantie_contractuels(self, garantie_id: str, data: Dict) -> Dict[str, Any]:
        """Met à jour les paramètres contractuels d'une garantie"""
        update_data = {
            "dureeMinContrat": data.get("duree_min_contrat"),
            "dureeMaxContrat": data.get("duree_max_contrat"),
            "resiliableAnnuellement": data.get("resiliable_annuellement")
        }
        
        response = requests.put(f"{self.service_url}/api/garanties/{garantie_id}", json=update_data, timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Paramètres contractuels de la garantie {garantie_id} mis à jour avec succès",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la mise à jour des paramètres contractuels: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _update_garantie_complet(self, garantie_id: str, data: Dict) -> Dict[str, Any]:
        """Met à jour tous les paramètres d'une garantie"""
        update_data = {
            "niveauCouverture": data.get("niveau_couverture"),
            "tauxRemboursement": data.get("taux_remboursement"),
            "typeMontant": data.get("type_montant"),
            "plafondAnnuel": data.get("plafond_annuel"),
            "plafondMensuel": data.get("plafond_mensuel"),
            "plafondParActe": data.get("plafond_par_acte"),
            "franchise": data.get("franchise"),
            "coutMoyenParSinistre": data.get("cout_moyen_par_sinistre"),
            "dureeMinContrat": data.get("duree_min_contrat"),
            "dureeMaxContrat": data.get("duree_max_contrat"),
            "resiliableAnnuellement": data.get("resiliable_annuellement")
        }
        
        response = requests.put(f"{self.service_url}/api/garanties/{garantie_id}", json=update_data, timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Tous les paramètres de la garantie {garantie_id} ont été mis à jour avec succès",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la mise à jour complète: {response.status_code} - {response.text}",
                "is_complete": False
            }
