import os
import requests
import re
from typing import Dict, List, Any
from .base_chatbot import BaseChatbot
from services.assurance_nlp_service import AssuranceNLPService

class UnifiedGarantieChatbot(BaseChatbot):
    """
    Chatbot unifié pour la création ET configuration de garanties d'assurance.
    Permet de créer une garantie et de la configurer en une seule conversation.
    """
    
    def __init__(self):
        # Initialiser le service NLP
        self.nlp_service = AssuranceNLPService()
        
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
    
    def extract_garantie_data(self, text: str) -> Dict[str, Any]:
        """Extrait les données de garantie en utilisant le service NLP avancé"""
        data = {}
        
        try:
            nlp_result = self.nlp_service.analyze_request(text)
            if nlp_result.get("action") == "CREATE_GARANTIE":
                extracted = nlp_result.get("data", {})
                
                if extracted.get("nomGarantie"): data["nom"] = extracted["nomGarantie"]
                if extracted.get("typeGarantie"): data["type_garantie"] = extracted["typeGarantie"]
                if extracted.get("statut"): data["statut"] = extracted["statut"]
                if extracted.get("tauxRemboursement") is not None: data["taux_remboursement"] = extracted["tauxRemboursement"] * 100
                if extracted.get("typeMontant"): data["type_montant"] = extracted["typeMontant"]
                if extracted.get("plafondAnnuel") is not None: data["plafond_annuel"] = extracted["plafondAnnuel"]
                if extracted.get("plafondMensuel") is not None: data["plafond_mensuel"] = extracted["plafondMensuel"]
                if extracted.get("plafondParActe") is not None: data["plafond_par_acte"] = extracted["plafondParActe"]
                if extracted.get("franchise") is not None: data["franchise"] = extracted["franchise"]
                if extracted.get("dureeMinContrat") is not None: data["duree_min_contrat"] = extracted["dureeMinContrat"]
                if extracted.get("dureeMaxContrat") is not None: data["duree_max_contrat"] = extracted["dureeMaxContrat"]
                if extracted.get("resiliableAnnuellement") is not None: data["resiliable_annuellement"] = extracted["resiliableAnnuellement"]
                if extracted.get("description"): data["description"] = extracted["description"]
                
                data["action_type"] = "creer"
                data["createur"] = "Assistant IA"
                
                # S'il y a des infos de base mais pas tout, essayer aussi l'ancienne extraction regex pour compléter
                # (omitted to keep it simple and rely on NLP)
        except Exception as e:
            print(f"Erreur NLP extraction garantie: {e}")
            
        return data
    
    def _has_sufficient_data(self, data: Dict[str, Any]) -> bool:
        """Vérifie si on a assez de données pour créer directement la garantie"""
        required_fields = ['nom', 'type_garantie']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return False
        
        # Si on a au moins le nom et le type, on peut créer
        return True
    
    def _create_garantie_direct(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Crée directement la garantie et retourne le résumé"""
        try:
            # Préparer les données pour l'API
            garantie_data = {
                'nomGarantie': data.get('nom', 'Garantie'),
                'description': f"Garantie {data.get('type_garantie', '').lower()} créée par assistant IA",
                'typeGarantie': data.get('type_garantie', 'DENTAIRE'),
                'statut': data.get('statut', 'ACTIF'),
                'tauxRemboursement': data.get('taux_remboursement', 0) / 100.0 if data.get('taux_remboursement', 0) > 1 else data.get('taux_remboursement', 0),
                'typeMontant': data.get('type_montant', 'FRAIS_REELS'),
                'plafondAnnuel': data.get('plafond_annuel', 0),
                'plafondMensuel': data.get('plafond_mensuel', 0),
                'plafondParActe': data.get('plafond_par_acte', 0),
                'franchise': data.get('franchise', 0),
                'coutMoyenParSinistre': data.get('cout_moyen_par_sinistre', 0),
                'dureeMinContrat': data.get('duree_min_contrat', 12),
                'dureeMaxContrat': data.get('duree_max_contrat', 60),
                'resiliableAnnuellement': data.get('resiliable_annuellement', False),
                'creePar': data.get('createur', 'Assistant IA')
            }
            
            # Preparer le headers
            headers = {"Content-Type": "application/json"}
            if hasattr(self, 'auth_token') and self.auth_token:
                headers["Authorization"] = self.auth_token
                
            # Appeler l'API pour créer la garantie
            response = requests.post(f"{self.service_url}/api/garanties", json=garantie_data, headers=headers)
            
            if response.status_code in [200, 201]:
                from .base_chatbot import ChatState
                self.state = ChatState.COMPLETED
                
                return {
                    "response": self._format_success_summary(data),
                    "state": self.state.value,
                    "is_complete": True
                }
            else:
                return {
                    "response": f"❌ Erreur lors de la création: {response.text}",
                    "state": "COLLECTING",
                    "is_complete": False
                }
                
        except Exception as e:
            return {
                "response": f"❌ Erreur technique: {str(e)}",
                "state": "COLLECTING", 
                "is_complete": False
            }
    
    def _format_success_summary(self, data: Dict[str, Any]) -> str:
        """Formate le résumé de succès de création"""
        summary = "✅ Garantie créée avec succès !\n\n"
        summary += "📋 **Détails de la garantie :**\n"
        
        if data.get('nom'):
            summary += f"• **Nom :** {data['nom']}\n"
        if data.get('type_garantie'):
            summary += f"• **Type :** {data['type_garantie']}\n"
        if data.get('statut'):
            summary += f"• **Statut :** {data['statut']}\n"
        if data.get('taux_remboursement'):
            summary += f"• **Taux de remboursement :** {data['taux_remboursement']}%\n"
        if data.get('type_montant'):
            summary += f"• **Type de montant :** {data['type_montant']}\n"
        if data.get('plafond_annuel'):
            summary += f"• **Plafond annuel :** {data['plafond_annuel']}€\n"
        if data.get('plafond_mensuel'):
            summary += f"• **Plafond mensuel :** {data['plafond_mensuel']}€\n"
        if data.get('plafond_par_acte'):
            summary += f"• **Plafond par acte :** {data['plafond_par_acte']}€\n"
        if data.get('franchise'):
            summary += f"• **Franchise :** {data['franchise']}€\n"
        if data.get('cout_moyen_par_sinistre'):
            summary += f"• **Coût moyen par sinistre :** {data['cout_moyen_par_sinistre']}€\n"
        if data.get('duree_min_contrat') and data.get('duree_max_contrat'):
            summary += f"• **Durée de contrat :** {data['duree_min_contrat']} à {data['duree_max_contrat']} mois\n"
        if data.get('resiliable_annuellement'):
            summary += f"• **Résiliable annuellement :** Oui\n"
            
        summary += "\n🎯 **Votre garantie est maintenant active !**"
        return summary
    
    def _handle_welcome(self, message: str) -> Dict[str, Any]:
        """Surcharge pour détecter les demandes de création en langage naturel"""
        # Si un message est fourni et contient "créer" et "garantie", traiter directement
        if message and message.strip():
            lower_message = message.lower()
            
            # Détection intelligente : si l'utilisateur veut créer une garantie
            if 'créer' in lower_message and 'garantie' in lower_message:
                try:
                    # Utiliser le vrai NLP service !
                    nlp_result = self.nlp_service.analyze_request(message)
                    action = nlp_result.get("action")
                    is_valid = nlp_result.get("validation", {}).get("isValid")
                    
                    if action == "CREATE_GARANTIE" and is_valid:
                        extracted_data = self.extract_garantie_data(message)
                        # Vérifier si on a assez de données pour créer directement
                        if self._has_sufficient_data(extracted_data):
                            # Pré-remplir toutes les données extraites
                            self.collected_data = extracted_data
                            self.collected_data['action_type'] = 'creer'
                            
                            # Créer directement la garantie
                            return self._create_garantie_direct(extracted_data)
                        else:
                            # Mode hybride : pré-remplir ce qu'on a et demander le reste
                            self.collected_data = extracted_data
                            self.collected_data['action_type'] = 'creer'
                            
                            from .base_chatbot import ChatState
                            self.state = ChatState.COLLECTING
                            self.current_field_index = -1
                            next_field = self._get_next_field()
                            if not next_field:
                                return self._handle_validation("")
                            
                            return {
                                "response": f"✅ J'ai extrait les informations de votre demande de garantie. Il me manque quelques détails pour finaliser :\n\n{next_field['question']}",
                                "state": self.state.value,
                                "is_complete": False,
                                "current_field": next_field["key"],
                                "progress": self._calculate_progress()
                            }
                    elif action in ["CREATE_PACK", "CREATE_PACK_WITH_GARANTIES"] and is_valid:
                        # Intelligence artificielle : Délégation au service Pack !
                        import sys
                        import os
                        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
                        from services.assurance_integration_service import AssuranceIntegrationService
                        
                        integration_service = AssuranceIntegrationService("http://localhost:9093")
                        pack_data = nlp_result.get("data", {})
                        
                        auth_token = getattr(self, 'auth_token', None)
                        if action == "CREATE_PACK":
                            res = integration_service.create_pack(pack_data, auth_token)
                        else:
                            res = integration_service.create_pack_with_garanties(pack_data, auth_token)
                            
                        from .base_chatbot import ChatState
                        if res.get("success"):
                            self.state = ChatState.COMPLETED
                            return {
                                "response": f"✅ J'ai détecté que vous souhaitiez créer un Pack au lieu d'une Garantie. C'est fait avec succès ! 🎉\n\nDétails :\nNom : {res.get('data', {}).get('nomPack', pack_data.get('nomPack'))}",
                                "state": self.state.value,
                                "is_complete": True
                            }
                        else:
                            return {
                                "response": f"❌ J'ai bien compris que vous vouliez créer un Pack, mais une erreur est survenue lors de la création : {res.get('error')} - {res.get('details')}",
                                "state": self.state.value,
                                "is_complete": False
                            }
                            
                except Exception as e:
                    print(f"Erreur extraction: {e}")
        
        # Comportement par défaut : poser la question initiale
        from .base_chatbot import ChatState
        self.state = ChatState.COLLECTING
        self.current_field_index = 0
        field = self._get_current_field()
        return {
            "response": f"Bonjour ! Je vais vous aider à créer un(e) {self.entity_name}.\n\n{field['question']}",
            "state": self.state.value,
            "is_complete": False,
            "current_field": field["key"],
            "progress": 0
        }
    
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
                
            # Vérifier si ce champ doit être demandé et n'est pas déjà rempli
            if self._should_ask_field(field["key"], data) and (field["key"] not in data or data[field["key"]] is None):
                self.current_field_index = i
                return field
        
        return None
    
    def _handle_collecting(self, message: str) -> Dict[str, Any]:
        # Intelligence IA globale : Délégation ou ONE SHOT si la phrase est complète !
        try:
            nlp_result = self.nlp_service.analyze_request(message)
            action = nlp_result.get("action")
            is_valid = nlp_result.get("validation", {}).get("isValid")
            
            if is_valid:
                if action == "CREATE_GARANTIE":
                    extracted_data = self.extract_garantie_data(message)
                    if self._has_sufficient_data(extracted_data):
                        self.collected_data.update(extracted_data)
                        return self._create_garantie_direct(self.collected_data)
                elif action in ["CREATE_PACK", "CREATE_PACK_WITH_GARANTIES"]:
                    import sys, os
                    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
                    from services.assurance_integration_service import AssuranceIntegrationService
                    integration_service = AssuranceIntegrationService("http://localhost:9093")
                    auth_token = getattr(self, 'auth_token', None)
                    if action == "CREATE_PACK":
                        res = integration_service.create_pack(nlp_result.get("data", {}), auth_token)
                    else:
                        res = integration_service.create_pack_with_garanties(nlp_result.get("data", {}), auth_token)
                    from .base_chatbot import ChatState
                    if res.get("success"):
                        self.state = ChatState.COMPLETED
                        return {
                            "response": f"✅ J'ai détecté que vous souhaitiez créer un Pack au lieu d'une Garantie. C'est fait avec succès ! 🎉",
                            "state": self.state.value,
                            "is_complete": True
                        }
                    else:
                        return {
                            "response": f"❌ Erreur lors de la création du Pack (délégation) : {res.get('error')}",
                            "state": self.state.value,
                            "is_complete": False
                        }
        except Exception as e:
            print(f"Erreur délégation collecting: {e}")

        # 🔥 TOUJOURS parser le message pour extraire des données
        try:
            extracted_data = self.extract_garantie_data(message)
            # Mettre à jour les champs avec les données extraites
            for key, value in extracted_data.items():
                if value is not None and key not in self.collected_data:
                    self.collected_data[key] = value
        except Exception as e:
            print(f"Erreur extraction: {e}")
        
        # Vérifier si on a assez de données pour créer directement
        if self._has_sufficient_data(self.collected_data):
            return self._create_garantie_direct(self.collected_data)
        
        field = self._get_current_field()
        if not field:
            return self._move_to_validation()

        # Si le champ actuel est déjà rempli grâce à l'extraction, passer au suivant
        if field["key"] in self.collected_data:
            self.current_field_index += 1
            next_field = self._get_current_field()
            if not next_field:
                return self._move_to_validation()
            
            return {
                "response": f"✅ J'ai extrait cette information automatiquement.\n\n{next_field['question']}",
                "state": self.state.value,
                "is_complete": False,
                "current_field": next_field["key"],
                "progress": self._calculate_progress()
            }

        # Sinon, essayer de parser normalement
        parsed_value = self._smart_parse(message, field)
        if parsed_value is None or not self._validate_field(parsed_value, field):
            return {
                "response": f"❌ {field.get('error_message', 'Valeur invalide')}\n\n{field['question']}",
                "state": self.state.value,
                "is_complete": False,
                "current_field": field["key"],
                "progress": self._calculate_progress()
            }

        self.collected_data[field["key"]] = parsed_value
        self.current_field_index += 1
        
        next_field = self._get_current_field()
        if not next_field:
            return self._move_to_validation()

        return {
            "response": f"✅ Bien enregistré.\n\n{next_field['question']}",
            "state": self.state.value,
            "is_complete": False,
            "current_field": next_field["key"],
            "progress": self._calculate_progress()
        }
    
    def _create_garantie(self, data: Dict) -> Dict[str, Any]:
        """Crée une nouvelle garantie"""
        garantie_data = {
            "nomGarantie": data["nom_garantie"],
            "description": data["description"],
            "typeGarantie": data["type_garantie"],
            "statut": data["statut"],
            "niveauCouverture": data.get("niveau_couverture"),
            "tauxRemboursement": data.get("taux_remboursement", 0) / 100.0 if data.get("taux_remboursement", 0) > 1 else data.get("taux_remboursement", 0),
            "typeMontant": data.get("type_montant"),
            "plafondAnnuel": data.get("plafond_annuel"),
            "plafondMensuel": data.get("plafond_mensuel"),
            "plafondParActe": data.get("plafond_par_acte"),
            "franchise": data.get("franchise"),
            "coutMoyenParSinistre": data.get("cout_moyen_par_sinistre"),
            "dureeMinContrat": data.get("duree_min_contrat"),
            "dureeMaxContrat": data.get("duree_max_contrat"),
            "resiliableAnnuellement": data.get("resiliable_annuellement"),
            "creePar": data.get("cree_par", "Assistant IA")
        }
        
        headers = {"Content-Type": "application/json"}
        if hasattr(self, 'auth_token') and self.auth_token:
            headers["Authorization"] = self.auth_token
            
        response = requests.post(f"{self.service_url}/api/garanties", json=garantie_data, headers=headers, timeout=10)
        
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
