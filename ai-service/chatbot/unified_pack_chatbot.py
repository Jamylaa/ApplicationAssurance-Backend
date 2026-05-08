import os
import requests
from typing import Dict, List, Any
from .base_chatbot import BaseChatbot
from services.assurance_nlp_service import AssuranceNLPService

class UnifiedPackChatbot(BaseChatbot):
    """
    Chatbot unifié pour la création ET configuration de packs d'assurance.
    Permet de créer un pack et de le configurer en une seule conversation.
    """
    
    def __init__(self):
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
                "key": "pack_id",
                "question": "Quel est l'ID du pack ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) >= 3,
                "error_message": "L'ID du pack doit contenir au moins 3 caractères.",
                "condition": lambda data: data.get("action_type") == "configurer"
            },
            {
                "key": "nom_pack",
                "question": "Quel est le nom du pack d'assurance ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) >= 3,
                "error_message": "Le nom du pack doit contenir au moins 3 caractères.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "description",
                "question": "Quelle est la description du pack ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) >= 10,
                "error_message": "La description doit contenir au moins 10 caractères.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "produit_id",
                "question": "Quel est l'ID du produit auquel appartient ce pack ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) >= 3,
                "error_message": "L'ID du produit doit contenir au moins 3 caractères.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "prix_mensuel",
                "question": "Quel est le prix mensuel du pack (en DT) ?",
                "type": "float",
                "required": True,
                "validation": lambda x: x > 0,
                "error_message": "Le prix mensuel doit être un nombre positif.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "duree_min_contrat",
                "question": "Quelle est la durée minimale du contrat (en mois) ?",
                "type": "int",
                "required": True,
                "validation": lambda x: 1 <= x <= 120,
                "error_message": "La durée minimale doit être entre 1 et 120 mois.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "duree_max_contrat",
                "question": "Quelle est la durée maximale du contrat (en mois) ?",
                "type": "int",
                "required": True,
                "validation": lambda x, data: x > data.get("duree_min_contrat", 0) and x <= 120,
                "error_message": "La durée maximale doit être supérieure à la durée minimale et <= 120 mois.",
                "depends_on": "duree_min_contrat",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "niveau_couverture",
                "question": "Quel est le niveau de couverture ? (basic / premium / gold)",
                "type": "choice",
                "choices": ["basic", "premium", "gold"],
                "required": True,
                "validation": lambda x: x in ["basic", "premium", "gold"],
                "error_message": "Le niveau doit être: basic, premium ou gold.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "statut",
                "question": "Quel est le statut du pack ? (ACTIF / INACTIF / EN_ATTENTE / SUSPENDU / EXPIRE / RESLIE)",
                "type": "choice",
                "choices": ["ACTIF", "INACTIF", "EN_ATTENTE", "SUSPENDU", "EXPIRE", "RESLIE"],
                "required": True,
                "validation": lambda x: x in ["ACTIF", "INACTIF", "EN_ATTENTE", "SUSPENDU", "EXPIRE", "RESLIE"],
                "error_message": "Veuillez choisir parmi: ACTIF, INACTIF, EN_ATTENTE, SUSPENDU, EXPIRE, RESLIE.",
                "condition": lambda data: data.get("action_type") == "creer"
            },
            {
                "key": "configuration_type",
                "question": "Quel type de configuration ? (statut / garanties / prix / conditions_eligibilite / complet)",
                "type": "choice",
                "choices": ["statut", "garanties", "prix", "conditions_eligibilite", "complet"],
                "required": True,
                "validation": lambda x: x in ["statut", "garanties", "prix", "conditions_eligibilite", "complet"],
                "error_message": "Veuillez choisir parmi: statut, garanties, prix, conditions_eligibilite, complet.",
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
                "key": "garantie_action",
                "question": "Quel action sur les garanties ? (ajouter / supprimer / modifier / lister)",
                "type": "choice",
                "choices": ["ajouter", "supprimer", "modifier", "lister"],
                "required": True,
                "validation": lambda x: x in ["ajouter", "supprimer", "modifier", "lister"],
                "error_message": "Veuillez choisir parmi: ajouter, supprimer, modifier, lister.",
                "condition": lambda data: data.get("configuration_type") in ["garanties", "complet"]
            },
            {
                "key": "garantie_id",
                "question": "Quel est l'ID de la garantie à ajouter/supprimer/modifier ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) >= 3,
                "error_message": "L'ID de la garantie doit contenir au moins 3 caractères.",
                "condition": lambda data: data.get("garantie_action") in ["ajouter", "supprimer", "modifier"]
            },
            {
                "key": "pack_garantie_id",
                "question": "Quel est l'ID du pack-garantie à supprimer/modifier ?",
                "type": "text",
                "required": True,
                "validation": lambda x: len(x.strip()) >= 3,
                "error_message": "L'ID du pack-garantie doit contenir au moins 3 caractères.",
                "condition": lambda data: data.get("garantie_action") in ["supprimer", "modifier"]
            },
            {
                "key": "new_prix",
                "question": "Quel est le nouveau prix mensuel (en DT) ?",
                "type": "float",
                "required": True,
                "validation": lambda x: x > 0,
                "error_message": "Le prix doit être un nombre positif.",
                "condition": lambda data: data.get("configuration_type") in ["prix", "complet"]
            },
            {
                "key": "add_condition_eligibilite",
                "question": "Voulez-vous ajouter une condition d'éligibilité spécifique pour ce pack ? (Oui/Non)",
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
                "question": "Quel est l'âge minimum autorisé pour ce pack ?",
                "type": "int",
                "required": True,
                "validation": lambda x: 0 <= x <= 120,
                "error_message": "L'âge minimum doit être entre 0 et 120."
            },
            {
                "key": "age_maximum",
                "question": "Quel est l'âge maximum autorisé pour ce pack ?",
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
        super().__init__(all_fields, service_url, "Pack")
        
        # Stocker les champs conditionnels séparément
        self.condition_fields = condition_fields
    
    def extract_pack_data(self, text: str) -> Dict[str, Any]:
        """Extrait les données du pack en utilisant le service NLP"""
        data = {}
        try:
            nlp_result = self.nlp_service.analyze_request(text)
            action = nlp_result.get("action")
            if action in ["CREATE_PACK", "CREATE_PACK_WITH_GARANTIES"]:
                extracted_raw = nlp_result.get("data", {})
                
                # Si c'est CREATE_PACK_WITH_GARANTIES, les données du pack sont imbriquées
                if action == "CREATE_PACK_WITH_GARANTIES" and "pack" in extracted_raw:
                    extracted = extracted_raw["pack"]
                else:
                    extracted = extracted_raw
                
                if extracted.get("nomPack"): data["nom_pack"] = extracted["nomPack"]
                if extracted.get("description"): data["description"] = extracted["description"]
                if extracted.get("produitId"): data["produit_id"] = extracted["produitId"]
                if extracted.get("prixMensuel") is not None: data["prix_mensuel"] = extracted["prixMensuel"]
                if extracted.get("dureeMinContrat") is not None: data["duree_min_contrat"] = extracted["dureeMinContrat"]
                if extracted.get("dureeMaxContrat") is not None: data["duree_max_contrat"] = extracted["dureeMaxContrat"]
                if extracted.get("niveauCouverture"): data["niveau_couverture"] = extracted["niveauCouverture"]
                if extracted.get("statut"): data["statut"] = extracted["statut"]
                if extracted.get("ageMinimum") is not None: data["age_minimum"] = extracted["ageMinimum"]
                if extracted.get("ageMaximum") is not None: data["age_maximum"] = extracted["ageMaximum"]
                if extracted.get("typeClients"): data["type_clients"] = [extracted["typeClients"]] # Chatbot attends list
                if extracted.get("ancienneteContratMois") is not None: data["anciennete_contrat_mois"] = extracted["ancienneteContratMois"]
                if extracted.get("couvertureGeographique"): data["couverture_geographique"] = extracted["couvertureGeographique"]
                
                data["action_type"] = "creer"
                data["createur"] = "Assistant IA"
        except Exception as e:
            print(f"Erreur NLP extraction pack: {e}")
        return data

    def _has_sufficient_data(self, data: Dict[str, Any]) -> bool:
        required_fields = ['nom_pack', 'produit_id', 'prix_mensuel']
        for field in required_fields:
            if field not in data or data[field] is None:
                return False
        return True

    def _create_pack_direct(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Crée directement le pack avec toutes les données"""
        try:
            data['action_type'] = 'creer'
            return self._create_pack(data)
        except Exception as e:
            return {
                "response": f"❌ Erreur technique: {str(e)}",
                "state": "COLLECTING", 
                "is_complete": False
            }

    def _handle_welcome(self, message: str) -> Dict[str, Any]:
        if message and message.strip():
            lower_message = message.lower()
            if 'créer' in lower_message and 'pack' in lower_message:
                try:
                    # Utiliser le vrai NLP service !
                    nlp_result = self.nlp_service.analyze_request(message)
                    action = nlp_result.get("action")
                    is_valid = nlp_result.get("validation", {}).get("isValid")
                    
                    if action in ["CREATE_PACK", "CREATE_PACK_WITH_GARANTIES"] and is_valid:
                        extracted_data = self.extract_pack_data(message)
                        if self._has_sufficient_data(extracted_data):
                            self.collected_data = extracted_data
                            self.collected_data['action_type'] = 'creer'
                            return self._create_pack_direct(extracted_data)
                        else:
                            self.collected_data = extracted_data
                            self.collected_data['action_type'] = 'creer'
                            from .base_chatbot import ChatState
                            self.state = ChatState.COLLECTING
                            self.current_field_index = -1
                            next_field = self._get_next_field()
                            if not next_field: return self._handle_validation("")
                            return {
                                "response": f"✅ J'ai extrait les informations de votre demande de pack. Il me manque quelques détails pour finaliser :\n\n{next_field['question']}",
                                "state": self.state.value,
                                "is_complete": False,
                                "current_field": next_field["key"],
                                "progress": self._calculate_progress()
                            }
                    elif action == "CREATE_GARANTIE" and is_valid:
                        # Intelligence artificielle : Délégation au service Garantie !
                        import sys
                        import os
                        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
                        from services.assurance_integration_service import AssuranceIntegrationService
                        
                        integration_service = AssuranceIntegrationService("http://localhost:9093")
                        garantie_data = nlp_result.get("data", {})
                        
                        auth_token = getattr(self, 'auth_token', None)
                        res = integration_service.create_garantie(garantie_data, auth_token)
                            
                        from .base_chatbot import ChatState
                        if res.get("success"):
                            self.state = ChatState.COMPLETED
                            return {
                                "response": f"✅ J'ai détecté que vous souhaitiez créer une Garantie au lieu d'un Pack. C'est fait avec succès ! 🎉\n\nDétails :\nNom : {res.get('data', {}).get('nomGarantie', garantie_data.get('nomGarantie'))}",
                                "state": self.state.value,
                                "is_complete": True
                            }
                        else:
                            return {
                                "response": f"❌ J'ai bien compris que vous vouliez créer une Garantie, mais une erreur est survenue lors de la création : {res.get('error')} - {res.get('details')}",
                                "state": self.state.value,
                                "is_complete": False
                            }
                except Exception as e:
                    print(f"Erreur extraction pack welcome: {e}")
        
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
        """Gère la collecte des données avec champs conditionnels"""
        # Intelligence IA globale : Délégation ou ONE SHOT si la phrase est complète !
        try:
            nlp_result = self.nlp_service.analyze_request(message)
            action = nlp_result.get("action")
            is_valid = nlp_result.get("validation", {}).get("isValid")
            
            if is_valid:
                if action in ["CREATE_PACK", "CREATE_PACK_WITH_GARANTIES"]:
                    extracted_data = self.extract_pack_data(message)
                    if self._has_sufficient_data(extracted_data):
                        self.collected_data.update(extracted_data)
                        return self._create_pack_direct(self.collected_data)
                elif action == "CREATE_GARANTIE":
                    import sys, os
                    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
                    from services.assurance_integration_service import AssuranceIntegrationService
                    integration_service = AssuranceIntegrationService("http://localhost:9093")
                    auth_token = getattr(self, 'auth_token', None)
                    res = integration_service.create_garantie(nlp_result.get("data", {}), auth_token)
                    from .base_chatbot import ChatState
                    if res.get("success"):
                        self.state = ChatState.COMPLETED
                        return {
                            "response": f"✅ J'ai détecté que vous souhaitiez créer une Garantie au lieu d'un Pack. C'est fait avec succès ! 🎉",
                            "state": self.state.value,
                            "is_complete": True
                        }
                    else:
                        return {
                            "response": f"❌ Erreur lors de la création de la Garantie (délégation) : {res.get('error')}",
                            "state": self.state.value,
                            "is_complete": False
                        }
        except Exception as e:
            print(f"Erreur délégation pack collecting: {e}")

        # 🔥 TOUJOURS parser le message pour extraire des données
        try:
            extracted_data = self.extract_pack_data(message)
            for key, value in extracted_data.items():
                if value is not None and key not in self.collected_data:
                    self.collected_data[key] = value
        except Exception as e:
            print(f"Erreur extraction pack: {e}")
            
        if self._has_sufficient_data(self.collected_data):
            return self._create_pack_direct(self.collected_data)

        data = self.collected_data
        current_field = self._get_current_field()
        
        if not current_field:
            return self._handle_welcome(message)
        
        field_key = current_field["key"]
        
        # Si le champ est déjà rempli par l'extraction, on passe au suivant
        if field_key in self.collected_data:
            self.current_field_index += 1
            next_field = self._get_current_field()
            if not next_field:
                return self._handle_validation("")
            return {
                "response": f"✅ J'ai extrait cette information automatiquement.\n\n{next_field['question']}",
                "state": self.state.value,
                "is_complete": False,
                "current_field": next_field["key"],
                "progress": self._calculate_progress()
            }
        
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
                return self._create_pack(data)
            elif action_type == "configurer":
                return self._configure_pack(data)
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
    
    def _create_pack(self, data: Dict) -> Dict[str, Any]:
        """Crée un nouveau pack"""
        pack_data = {
            "nomPack": data.get("nom_pack"),
            "description": data.get("description"),
            "produitId": data.get("produit_id"),
            "prixMensuel": data.get("prix_mensuel"),
            "dureeMinContrat": data.get("duree_min_contrat"),
            "dureeMaxContrat": data.get("duree_max_contrat"),
            "niveauCouverture": data.get("niveau_couverture"),
            "statut": data.get("statut", "ACTIF")
        }
        
        # Ajouter les conditions d'éligibilité si présentes
        if data.get("add_condition_eligibilite"):
            pack_data.update({
                "ageMinimum": data.get("age_minimum"),
                "ageMaximum": data.get("age_maximum"),
                "typeClients": data.get("type_clients", []),
                "ancienneteContratMois": data.get("anciennete_contrat_mois"),
                "couvertureGeographique": data.get("couverture_geographique")
            })
        
        headers = {"Content-Type": "application/json"}
        if hasattr(self, 'auth_token') and self.auth_token:
            headers["Authorization"] = self.auth_token

        response = requests.post(f"{self.service_url}/api/packs", json=pack_data, headers=headers, timeout=10)
        
        if response.status_code == 201:
            pack = response.json()
            return {
                "response": f"Pack '{pack['nomPack']}' créé avec succès ! ID: {pack['idPack']}",
                "is_complete": True,
                "data": pack
            }
        else:
            return {
                "response": f"Erreur lors de la création: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _configure_pack(self, data: Dict) -> Dict[str, Any]:
        """Configure un pack existant"""
        pack_id = data["pack_id"]
        config_type = data["configuration_type"]
        
        if config_type == "statut":
            return self._update_pack_statut(pack_id, data["new_statut"])
        elif config_type == "garanties":
            return self._manage_pack_garanties(pack_id, data)
        elif config_type == "prix":
            return self._update_pack_prix(pack_id, data["new_prix"])
        elif config_type == "conditions_eligibilite":
            return self._update_pack_conditions(pack_id, data)
        elif config_type == "complet":
            return self._update_pack_complet(pack_id, data)
        else:
            return {
                "response": "Type de configuration non valide.",
                "is_complete": False
            }
    
    def _update_pack_statut(self, pack_id: str, new_statut: str) -> Dict[str, Any]:
        """Met à jour le statut d'un pack"""
        response = requests.patch(f"{self.service_url}/api/packs/{pack_id}/desactiver", timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Statut du pack {pack_id} mis à jour avec succès vers {new_statut}",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la mise à jour du statut: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _manage_pack_garanties(self, pack_id: str, data: Dict) -> Dict[str, Any]:
        """Gère les garanties d'un pack"""
        garantie_action = data.get("garantie_action")
        
        if garantie_action == "ajouter":
            return self._add_garantie_to_pack(pack_id, data)
        elif garantie_action == "supprimer":
            return self._remove_garantie_from_pack(pack_id, data)
        elif garantie_action == "modifier":
            return self._modify_garantie_in_pack(pack_id, data)
        elif garantie_action == "lister":
            return self._list_pack_garanties(pack_id)
        else:
            return {
                "response": "Action sur garantie non valide.",
                "is_complete": False
            }
    
    def _add_garantie_to_pack(self, pack_id: str, data: Dict) -> Dict[str, Any]:
        """Ajoute une garantie à un pack"""
        garantie_data = {
            "packId": pack_id,
            "garantieId": data["garantie_id"],
            "optionnelle": False,  # Valeur par défaut
            "prixSupplementaire": 0.0  # Valeur par défaut
        }
        
        response = requests.post(f"{self.service_url}/api/pack-configuration/{pack_id}/garanties/{data['garantie_id']}", 
                              json=garantie_data, timeout=10)
        
        if response.status_code == 201:
            return {
                "response": f"Garantie {data['garantie_id']} ajoutée avec succès au pack {pack_id}",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de l'ajout de garantie: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _remove_garantie_from_pack(self, pack_id: str, data: Dict) -> Dict[str, Any]:
        """Supprime une garantie d'un pack"""
        response = requests.delete(f"{self.service_url}/api/pack-configuration/{pack_id}/garanties/{data['pack_garantie_id']}", 
                                timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Garantie {data['pack_garantie_id']} supprimée avec succès du pack {pack_id}",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la suppression de garantie: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _modify_garantie_in_pack(self, pack_id: str, data: Dict) -> Dict[str, Any]:
        """Modifie une garantie dans un pack"""
        garantie_data = {
            "optionnelle": False,  # Valeur par défaut
            "prixSupplementaire": 0.0  # Valeur par défaut
        }
        
        response = requests.put(f"{self.service_url}/api/pack-configuration/{pack_id}/garanties/{data['pack_garantie_id']}", 
                              json=garantie_data, timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Garantie {data['pack_garantie_id']} modifiée avec succès dans le pack {pack_id}",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la modification de garantie: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _list_pack_garanties(self, pack_id: str) -> Dict[str, Any]:
        """Liste les garanties d'un pack"""
        response = requests.get(f"{self.service_url}/api/pack-configuration/{pack_id}/garanties", timeout=10)
        
        if response.status_code == 200:
            garanties = response.json()
            return {
                "response": f"Le pack {pack_id} contient {len(garanties)} garantie(s): {', '.join([g['idGarantie'] for g in garanties])}",
                "is_complete": True,
                "data": garanties
            }
        else:
            return {
                "response": f"Erreur lors de la liste des garanties: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _update_pack_prix(self, pack_id: str, new_prix: float) -> Dict[str, Any]:
        """Met à jour le prix d'un pack"""
        update_data = {"prixMensuel": new_prix}
        
        response = requests.put(f"{self.service_url}/api/packs/{pack_id}", json=update_data, timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Prix du pack {pack_id} mis à jour avec succès à {new_prix} DT/mois",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la mise à jour du prix: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _update_pack_conditions(self, pack_id: str, data: Dict) -> Dict[str, Any]:
        """Met à jour les conditions d'éligibilité d'un pack"""
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
        
        response = requests.put(f"{self.service_url}/api/packs/{pack_id}", json=update_data, timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Conditions d'éligibilité du pack {pack_id} mises à jour avec succès",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la mise à jour des conditions: {response.status_code} - {response.text}",
                "is_complete": False
            }
    
    def _update_pack_complet(self, pack_id: str, data: Dict) -> Dict[str, Any]:
        """Met à jour complètement un pack"""
        update_data = {}
        
        # Ajouter le prix si présent
        if data.get("new_prix"):
            update_data["prixMensuel"] = data["new_prix"]
        
        # Ajouter les conditions d'éligibilité si présentes
        if data.get("add_condition_eligibilite"):
            update_data.update({
                "ageMinimum": data.get("age_minimum"),
                "ageMaximum": data.get("age_maximum"),
                "typeClients": data.get("type_clients", []),
                "ancienneteContratMois": data.get("anciennete_contrat_mois"),
                "couvertureGeographique": data.get("couverture_geographique")
            })
        
        if not update_data:
            return {
                "response": "Aucune donnée à mettre à jour.",
                "is_complete": True
            }
        
        response = requests.put(f"{self.service_url}/api/packs/{pack_id}", json=update_data, timeout=10)
        
        if response.status_code == 200:
            return {
                "response": f"Pack {pack_id} mis à jour complètement avec succès",
                "is_complete": True
            }
        else:
            return {
                "response": f"Erreur lors de la mise à jour complète: {response.status_code} - {response.text}",
                "is_complete": False
            }
