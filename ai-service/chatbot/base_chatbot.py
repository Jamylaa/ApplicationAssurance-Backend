import re
import requests
from typing import Dict, List, Optional, Any, Union
from enum import Enum

class ChatState(Enum):
    """États de la conversation partagés par tous les chatbots d'administration"""
    WELCOME = "welcome"
    COLLECTING = "collecting"
    VALIDATION = "validation"
    CONFIRMATION = "confirmation"
    CORRECTION = "correction"
    COMPLETED = "completed"

class BaseChatbot:
    """
    Classe de base pour les chatbots de création d'entités.
    Gère la state machine, le parsing, la correction et les erreurs API de manière uniforme.
    """
    
    def __init__(self, fields: List[Dict], service_url: str, entity_name: str):
        self.fields = fields
        self.service_url = service_url
        self.entity_name = entity_name
        self.state = ChatState.WELCOME
        self.current_field_index = 0
        self.collected_data = {}
        self.validation_errors = []
        self.correction_field = None
        self.has_api_error = False
    
    def reset_state(self):
        """Réinitialise l'état du chatbot"""
        self.state = ChatState.WELCOME
        self.current_field_index = 0
        self.collected_data = {}
        self.validation_errors = []
        self.correction_field = None
        self.has_api_error = False

    def process_message(self, message: str) -> Dict[str, Any]:
        """Dispatche le message selon l'état actuel"""
        message = message.strip()
        
        if self.state == ChatState.WELCOME:
            return self._handle_welcome(message)
        elif self.state == ChatState.COLLECTING:
            return self._handle_collecting(message)
        elif self.state == ChatState.VALIDATION:
            return self._handle_validation(message)
        elif self.state == ChatState.CONFIRMATION:
            return self._handle_confirmation(message)
        elif self.state == ChatState.CORRECTION:
            return self._handle_correction(message)
        elif self.state == ChatState.COMPLETED:
            return self._handle_completed(message)
        return self._error_response("État inconnu")

    def _handle_welcome(self, message: str) -> Dict[str, Any]:
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

    def _handle_collecting(self, message: str) -> Dict[str, Any]:
        field = self._get_current_field()
        if not field:
            return self._move_to_validation()

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

    def _move_to_validation(self) -> Dict[str, Any]:
        """Déclenche la phase de validation"""
        return self._handle_validation("")

    def _handle_validation(self, message: str) -> Dict[str, Any]:
        self.state = ChatState.VALIDATION
        errors = self._validate_all_data()
        if errors:
            self.validation_errors = errors
            self.state = ChatState.CONFIRMATION # Pour demander si on veut corriger
            error_list = "\n".join([f"• {e}" for e in errors])
            return {
                "response": f"⚠️ Des erreurs ont été détectées :\n{error_list}\n\nVoulez-vous corriger ? (Oui/Non)",
                "state": self.state.value,
                "is_complete": False
            }
        return self._move_to_confirmation()

    def _move_to_confirmation(self) -> Dict[str, Any]:
        self.state = ChatState.CONFIRMATION
        summary = self._generate_summary()
        return {
            "response": f" Récapitulatif :\n{summary}\n\nConfirmez-vous la création ? (Oui/Non)",
            "state": self.state.value,
            "is_complete": False,
            "collected_data": self.collected_data
        }

    def _handle_confirmation(self, message: str) -> Dict[str, Any]:
        choice = self._parse_boolean(message)
        if choice is True:
            # Si on a des erreurs de validation OU si on sort d'une erreur API
            if self.validation_errors or self.has_api_error:
                self.has_api_error = False # Reset après usage
                self.state = ChatState.CORRECTION
                return self._ask_which_field_to_correct()
            
            return self._perform_create()
        elif choice is False:
            # Si l'utilisateur dit Non alors qu'on propose de corriger
            if self.validation_errors or self.has_api_error:
                 self.has_api_error = False # Reset après usage
                 return {"response": "Création annulée.", "is_complete": True}
            
            # Cas normal: Non à la confirmation -> Correction
            self.state = ChatState.CORRECTION
            return self._ask_which_field_to_correct()
        return {"response": "Veuillez répondre par Oui ou Non.", "state": self.state.value}

    def _ask_which_field_to_correct(self) -> Dict[str, Any]:
        fields_list = "\n".join([f"• {f['key']}" for f in self.fields])
        return {
            "response": f"Quel champ souhaitez-vous corriger ?\n\n{fields_list}",
            "state": self.state.value
        }

    def _handle_correction(self, message: str) -> Dict[str, Any]:
        if not self.correction_field:
            field_key = message.lower().strip()
            field = next((f for f in self.fields if f["key"].lower() == field_key), None)
            if not field:
                return {"response": f"Champ '{field_key}' inconnu. Réessayez.", "state": self.state.value}
            self.correction_field = field
            return {"response": f"Quelle est la nouvelle valeur pour : {field['question']}", "state": self.state.value}
        
        # On a le champ, on parse la valeur
        val = self._smart_parse(message, self.correction_field)
        if val is not None and self._validate_field(val, self.correction_field):
            self.collected_data[self.correction_field["key"]] = val
            self.correction_field = None
            return self._handle_validation("") # Re-valider tout
        
        return {"response": f"❌ Invalide. {self.correction_field['error_message']}\n{self.correction_field['question']}", "state": self.state.value}

    def _perform_create(self) -> Dict[str, Any]:
        """À implémenter par les classes filles pour l'appel API spécifique"""
        raise NotImplementedError

    def _handle_api_response(self, response: requests.Response) -> Dict[str, Any]:
        """Gère les réponses API de manière intelligente, notamment le 400"""
        if response.status_code in [200, 201]:
            self.state = ChatState.COMPLETED
            return {"response": f"✅ {self.entity_name} créé(e) avec succès !", "is_complete": True}
        
        if response.status_code == 400:
            try:
                error_data = response.json()
                msg = error_data.get("message", "Données invalides")
                self.has_api_error = True # Verrouiller l'état d'erreur
                return {
                    "response": f"❌ L'API a rejeté la demande : {msg}\n\nSouhaitez-vous corriger un champ ? (Oui/Non)",
                    "state": ChatState.CONFIRMATION.value,
                    "is_complete": False,
                    "has_api_error": True
                }
            except:
                pass
        
        return {"response": f"❌ Erreur serveur (HTTP {response.status_code}).", "is_complete": False}

    # --- Utils ---
    def _get_current_field(self) -> Optional[Dict]:
        return self.fields[self.current_field_index] if self.current_field_index < len(self.fields) else None

    def _calculate_progress(self) -> int:
        return int((len(self.collected_data) / len(self.fields)) * 100)

    def _validate_field(self, value: Any, field: Dict) -> bool:
        try:
            if "depends_on" in field:
                return field["validation"](value, self.collected_data)
            return field["validation"](value)
        except:
            return False

    def _validate_all_data(self) -> List[str]:
        """Validation croisée basique. Peut être surchargée."""
        return []

    def _generate_summary(self) -> str:
        lines = []
        for f in self.fields:
            val = self.collected_data.get(f["key"], "Non saisi")
            lines.append(f"• {f['key']} : {val}")
        return "\n".join(lines)

    def _smart_parse(self, message: str, field: Dict) -> Any:
        t = field["type"]
        msg = message.strip()
        if t == "text": return msg if msg else None
        if t == "int":
            nums = re.findall(r'\d+', msg)
            if not nums: return None
            val = int(nums[0])
            if 'an' in msg.lower(): val *= 12
            return val
        if t == "float":
            nums = re.findall(r'\d+\.?\d*', msg.replace(',', '.'))
            return float(nums[0]) if nums else None
        if t == "boolean": return self._parse_boolean(msg)
        if t == "choice":
            choices = field.get("choices", [])
            for c in choices:
                if c.lower() in msg.lower(): return c
            return None
        if t == "list":
            items = [i.strip() for i in re.split(r'[,\s;]+', msg) if i.strip()]
            return items if items else None
        return None

    def _parse_boolean(self, message: str) -> Optional[bool]:
        m = message.lower().strip()
        # Utilisation de regex pour éviter les faux positifs (comme 'non' contenant 'o')
        if re.search(r'\b(oui|yes|o|vrai|actif|ok)\b', m): return True
        if re.search(r'\b(non|no|n|faux|inactif|stop)\b', m): return False
        return None

    def _handle_completed(self, message: str) -> Dict[str, Any]:
        return {"response": "Opération terminée. Tapez 'Pack', 'Produit' ou 'Garantie' pour recommencer.", "is_complete": True}

    def _error_response(self, msg: str) -> Dict[str, Any]:
        return {"response": f"Erreur technique: {msg}", "is_complete": False}
    
    def get_welcome_message(self) -> Dict[str, Any]:
        self.reset_state()
        return self._handle_welcome("")
