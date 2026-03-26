""" Chatbot de Recommandation - Moteur conversationnel spécialisé
Gère exclusivement les conversations de recommandation de packs d'assurance.
Extrait les informations utilisateur et appelle le service de recommandation. """
import re
import requests
import os

class RecommendationChatbot:
    """Chatbot spécialisé dans les recommandations de packs d'assurance santé.
    Ce chatbot se concentre uniquement sur:
    - La collecte d'informations personnelles pour la recommandation
    - L'analyse des besoins spécifiques (santé, budget, etc.)
    - La communication avec le service de recommandation
    - La présentation des packs recommandés
    """
    # Définition des champs à collecter pour la recommandation
    RECOMMENDATION_FIELDS = [
        {
            "key": "age",
            "question": "Quel est votre âge ?",
            "question_fr": "Pour commencer, pourriez-vous me donner votre âge ?",
            "type": "int",
            "required": True
        },
        {
            "key": "sexe",
            "question": "Quel est votre sexe ?",
            "question_fr": "Quel est votre sexe ? (Homme / Femme)",
            "type": "choice",
            "choices": ["Homme", "Femme", "M", "F"],
            "required": True
        },
        {
            "key": "profession",
            "question": "Quelle est votre profession ?",
            "question_fr": "Quelle est votre profession ?",
            "type": "text",
            "required": True
        },
        {
            "key": "situation_familiale",
            "question": "Quelle est votre situation familiale ?",
            "question_fr": "Quelle est votre situation familiale ? (Célibataire / Marié(e) / Divorcé(e) / Veuf/Veuve)",
            "type": "choice",
            "choices": ["Célibataire", "Marié", "Mariée", "Divorcé", "Divorcée", "Veuf", "Veuve"],
            "required": True
        },
        {
            "key": "maladie_chronique",
            "question": "Souffrez-vous de maladies chroniques ?",
            "question_fr": "Souffrez-vous de maladies chroniques ? (Oui / Non)",
            "type": "boolean",
            "required": True
        },
        {
            "key": "diabetique",
            "question": "Êtes-vous diabétique ?",
            "question_fr": "Êtes-vous diabétique ? (Oui / Non)",
            "type": "boolean",
            "required": True,
            "condition": lambda data: data.get("maladie_chronique") == True
        },
        {
            "key": "tension",
            "question": "Souffrez-vous de tension artérielle ?",
            "question_fr": "Avez-vous des problèmes de tension artérielle ? (Oui / Non)",
            "type": "boolean",
            "required": True,
            "condition": lambda data: data.get("maladie_chronique") == True
        },
        {
            "key": "maladies_legeres",
            "question": "Avez-vous des maladies légères ?",
            "question_fr": "Avez-vous des problèmes de santé légers (allergies, rhumes fréquents, etc.) ? (Oui / Non)",
            "type": "boolean",
            "required": True
        },
        {
            "key": "nombre_beneficiaires",
            "question": "Combien de bénéficiaires souhaitez-vous couvrir ?",
            "question_fr": "Combien de personnes (y compris vous-même) souhaitez-vous couvrir ?",
            "type": "int",
            "required": True
        },
        {
            "key": "duree_contrat_souhaitee",
            "question": "Quelle durée de contrat souhaitez-vous (en mois) ?",
            "question_fr": "Quelle durée de contrat souhaitez-vous ? (en mois, ex: 12, 24, 36)",
            "type": "int",
            "required": True
        },
        {
            "key": "budget_mensuel",
            "question": "Quel est votre budget mensuel (en DT) ?",
            "question_fr": "Quel est votre budget mensuel approximatif pour l'assurance ? (en Dinars)",
            "type": "float",
            "required": False
        }
    ]

    def __init__(self):
        self.recommendation_service_url = os.getenv("RECOMMENDATION_SERVICE_URL", "http://localhost:9095")

    def process_message(self, message: str, history: list, client_id: str = "") -> dict:
        """
        Traite un message utilisateur dans le contexte de conversation de recommandation.

        Args:
            message: Le message brut de l'utilisateur
            history: L'historique de la conversation [{"role": "bot"/"user", "content": "..."}]
            client_id: ID du client (optionnel)

        Returns:
            dict avec : response (str), collected_data (dict), is_complete (bool),
                         next_field (str), recommendations (list si terminé)
        """
        print(f"DEBUG: Message reçu: '{message}'")
        print(f"DEBUG: Historique: {len(history)} messages")
        
        # Reconstituer les données collectées depuis l'historique
        collected_data = self._extract_collected_data(history)
        print(f"DEBUG: Données collectées: {collected_data}")

        # Déterminer le prochain champ
        current_field = self._get_current_field(collected_data)
        print(f"DEBUG: Champ actuel: {current_field['key'] if current_field else None}")

        if current_field:
            extracted_value = self._extract_value(message, current_field)
            print(f"DEBUG: Valeur extraite: {extracted_value}")
            if extracted_value is not None:
                collected_data[current_field["key"]] = extracted_value
                print(f"DEBUG: Données mises à jour: {collected_data}")
            else:
                return {
                    "response": f"Désolé, je n'ai pas compris. {current_field['question_fr']}",
                    "collected_data": collected_data,
                    "is_complete": False,
                    "next_field": current_field["key"]
                }

        next_field = self._get_current_field(collected_data)
        print(f"DEBUG: Prochain champ: {next_field['key'] if next_field else None}")

        if next_field is None:
            return self._finalize_recommendation(collected_data, client_id)

        progress = self._calculate_progress(collected_data)
        return {
            "response": next_field["question_fr"],
            "collected_data": collected_data,
            "is_complete": False,
            "next_field": next_field["key"],
            "progress": progress
        }

    def get_welcome_message(self) -> dict:
        """Message de bienvenue et première question."""
        welcome = ("Bonjour ! Je suis votre assistant d'assurance santé. "
                   "Je vais vous poser quelques questions pour trouver le pack "
                   "d'assurance le mieux adapté à vos besoins.\n\n")

        first_field = self.RECOMMENDATION_FIELDS[0]
        return {
            "response": welcome + first_field["question_fr"],
            "collected_data": {},
            "is_complete": False,
            "next_field": first_field["key"],
            "progress": 0
        }

    def _extract_collected_data(self, history: list) -> dict:
        """Replay de l'historique pour reconstituer les données collectées."""
        collected = {}
        field_index = 0
        
        for i in range(len(history)):
            if history[i].get("role") == "user" and field_index < len(self.RECOMMENDATION_FIELDS):
                # Trouver le champ courant (en tenant compte des conditions)
                while field_index < len(self.RECOMMENDATION_FIELDS):
                    field = self.RECOMMENDATION_FIELDS[field_index]
                    condition = field.get("condition")
                    if condition and not condition(collected):
                        field_index += 1
                        continue
                    break

                if field_index < len(self.RECOMMENDATION_FIELDS):
                    value = self._extract_value(history[i]["content"], self.RECOMMENDATION_FIELDS[field_index])
                    if value is not None:
                        collected[self.RECOMMENDATION_FIELDS[field_index]["key"]] = value
                        field_index += 1

        return collected

    def _get_current_field(self, collected_data: dict) -> dict:
        """Retourne le prochain champ non rempli qui satisfait ses conditions."""
        for field in self.RECOMMENDATION_FIELDS:
            if field["key"] not in collected_data:
                # Vérifier la condition
                condition = field.get("condition")
                if condition and not condition(collected_data):
                    continue
                return field
        return None

    def _extract_value(self, message: str, field: dict):
        """Extraction NLP : analyse le message utilisateur pour en extraire la valeur."""
        message = message.strip()
        field_type = field["type"]
        field_key = field["key"]
        
        print(f"DEBUG: Extraction pour champ '{field_key}' (type: {field_type}) depuis message: '{message}'")

        if field_type == "int":
            result = self._extract_int(message)
        elif field_type == "float":
            result = self._extract_float(message)
        elif field_type == "boolean":
            result = self._extract_boolean(message)
        elif field_type == "choice":
            result = self._extract_choice(message, field.get("choices", []))
        elif field_type == "multi_choice":
            result = self._extract_multi_choice(message, field.get("choices", []))
        elif field_type == "text":
            result = message if len(message) > 0 else None
        else:
            result = None

        print(f"DEBUG: Résultat extraction pour '{field_key}': {result}")
        return result

    def _extract_int(self, message: str):
        """Extraire un entier depuis un message."""
        import re
        numbers = re.findall(r'(?<!\d)\d+(?!\d)', message)
        if numbers:
            return int(numbers[0])
        # Mots-nombres courants
        word_numbers = {
            "un": 1, "une": 1, "deux": 2, "trois": 3, "quatre": 4,
            "cinq": 5, "six": 6, "sept": 7, "huit": 8, "neuf": 9, "dix": 10,
            "vingt": 20, "trente": 30, "quarante": 40, "cinquante": 50,
            "soixante": 60, "zéro": 0, "zero": 0
        }
        for word, num in word_numbers.items():
            if re.search(r'\b' + word + r'\b', message.lower()):
                return num
        return None

    def _extract_float(self, message: str):
        """Extraire un nombre décimal depuis un message."""
        # Remplacer la virgule par un point (format français)
        message_normalized = message.replace(",", ".")
        numbers = re.findall(r'\d+\.?\d*', message_normalized)
        if numbers:
            return float(numbers[0])
        return None

    def _extract_boolean(self, message: str):
        """Extraire un booléen depuis un message de manière robuste."""
        import re
        message_lower = message.lower().strip()
        
        # Correspondance exacte prioritaire (plus robuste)
        if message_lower in ["oui", "yes", "o", "y", "vrai", "true", "1"]:
            return True
        if message_lower in ["non", "no", "n", "faux", "false", "0", "non merci"]:
            return False
            
        positive = [r'\boui\b', r'\byes\b', r'\bo\b', r'\by\b', r'\bvrai\b', r'\btrue\b',
                     r'bien sûr', r'absolument', r'effectivement', r'affirmatif',
                     r'tout à fait', r'exactement', r'en effet']
        negative = [r'\bnon\b', r'\bno\b', r'\bn\b', r'\bfaux\b', r'\bfalse\b',
                     r'pas du tout', r'aucunement', r'négatif', r'jamais',
                     r'pas vraiment']

        for pattern in positive:
            if re.search(pattern, message_lower):
                return True
        for pattern in negative:
            if re.search(pattern, message_lower):
                return False
        return None

    def _extract_choice(self, message: str, choices: list) -> str:
        """Extraire un choix parmi les options disponibles."""
        import re
        message_lower = message.lower().strip()

        # Mapping des synonymes courants avec \b pour limites de mots
        synonyms = {
            r'\bhomme\b': "M", r'\bh\b': "M", r'\bmasculin\b': "M", r'\bm\b': "M", r'\bgarçon\b': "M",
            r'\bfemme\b': "F", r'\bf\b': "F", r'\bféminin\b': "F", r'\bfille\b': "F",
            r'\bcélibataire\b': "Célibataire", r'\bcelibataire\b': "Célibataire",
            r'\bmarié\b': "Marié", r'\bmariée\b': "Mariée", r'\bmarie\b': "Marié",
            r'\bdivorcé\b': "Divorcé", r'\bdivorcée\b': "Divorcée", r'\bdivorce\b': "Divorcé",
            r'\bveuf\b': "Veuf", r'\bveuve\b': "Veuve"
        }

        # Essayer les synonymes d'abord
        for pattern, value in synonyms.items():
            if re.search(pattern, message_lower):
                if value in choices or value.lower() in [c.lower() for c in choices]:
                    return value

        # Correspondance directe
        for choice in choices:
            if re.search(r'\b' + re.escape(choice.lower()) + r'\b', message_lower):
                return choice

        # Correspondance exacte si toujours rien
        for choice in choices:
            if message_lower == choice.lower():
                return choice

        return None

    def _extract_multi_choice(self, message: str, choices: list):
        """Extraire plusieurs choix depuis un message."""
        message_lower = message.lower()
        selected = []

        # Mapping de types vers les noms de garanties
        guarantee_mapping = {
            "maladie légère": "MALADIE_LEGERE", "maladie legere": "MALADIE_LEGERE",
            "légère": "MALADIE_LEGERE", "legere": "MALADIE_LEGERE",
            "maladie chronique": "MALADIE_CHRONIQUE", "chronique": "MALADIE_CHRONIQUE",
            "ophtalmologie": "OPHTALMOLOGIE", "ophtalmo": "OPHTALMOLOGIE", "yeux": "OPHTALMOLOGIE",
            "dentaire": "DENTAIRE", "dents": "DENTAIRE",
            "hospitalisation": "HOSPITALISATION", "hôpital": "HOSPITALISATION", "hopital": "HOSPITALISATION",
            "maternité": "MATERNITE", "maternite": "MATERNITE"
        }

        for keyword, value in guarantee_mapping.items():
            if keyword in message_lower and value not in selected:
                selected.append(value)

        # Si "tout" ou "toutes", sélectionner tout
        if "tout" in message_lower or "toutes" in message_lower:
            selected = list(set(guarantee_mapping.values()))

        return selected if selected else None

    def _calculate_progress(self, collected_data: dict) -> int:
        """Calculer le pourcentage de progression."""
        total_applicable = sum(1 for f in self.RECOMMENDATION_FIELDS
                                if not f.get("condition") or f["condition"](collected_data))
        filled = len(collected_data)
        return int((filled / max(total_applicable, 1)) * 100)

    def _finalize_recommendation(self, collected_data: dict, client_id: str = "") -> dict:
        """
        Envoyer les données collectées au Recommendation Service Spring Boot
        pour obtenir les packs recommandés.
        """
        # Préparer le payload pour le Recommendation Service
        payload = {
            "clientId": client_id,
            "age": collected_data.get("age", 0),
            "sexe": "M" if collected_data.get("sexe") in ["M", "Homme"] else "F",
            "profession": collected_data.get("profession", ""),
            "situationFamiliale": collected_data.get("situation_familiale", ""),
            "maladieChronique": collected_data.get("maladie_chronique", False),
            "diabetique": collected_data.get("diabetique", False),
            "tension": collected_data.get("tension", False),
            "maladiesLegeres": collected_data.get("maladies_legeres", False),
            "nombreBeneficiaires": collected_data.get("nombre_beneficiaires", 1),
            "dureeContratSouhaitee": collected_data.get("duree_contrat_souhaitee", 12),
            "budgetMensuel": collected_data.get("budget_mensuel", 0)
        }

        try:
            response = requests.post(
                f"{self.recommendation_service_url}/api/recommendations/evaluate",
                json=payload,
                timeout=10
            )
            if response.status_code == 200:
                recommendations = response.json()
                scored_packs = recommendations.get("scoredPacks", [])

                if scored_packs:
                    # Construire le message de réponse
                    msg = "Voici les packs d'assurance recommandés pour votre profil :\n\n"
                    for i, pack in enumerate(scored_packs[:5], 1):
                        msg += f"**{i}. {pack.get('nomPack', 'Pack')}** — Score : {pack.get('score', 0)}/100\n"
                        raisons = pack.get("raisons", [])
                        if raisons:
                            for r in raisons[:3]:
                                msg += f"   • {r}\n"
                        msg += "\n"

                    msg += "Souhaitez-vous plus de détails sur un pack en particulier ?"
                else:
                    msg = ("Aucun pack ne correspond parfaitement à votre profil pour le moment. "
                           "Nos conseillers peuvent vous proposer une solution personnalisée.")

                return {
                    "response": msg,
                    "collected_data": collected_data,
                    "is_complete": True,
                    "recommendations": recommendations
                }
            else:
                return {
                    "response": "Une erreur est survenue lors de l'analyse. Veuillez réessayer.",
                    "collected_data": collected_data,
                    "is_complete": False,
                    "error": f"HTTP {response.status_code}"
                }

        except requests.exceptions.ConnectionError:
            # Fallback : retourner les données collectées sans recommandation
            return {
                "response": ("Vos réponses ont été enregistrées. "
                             "Le service de recommandation n'est pas disponible actuellement. "
                             "Un conseiller vous recontactera avec les meilleures offres."),
                "collected_data": collected_data,
                "is_complete": True,
                "recommendations": None
            }

    def get_user_profile_summary(self, collected_data: dict) -> str:
        """Génère un résumé du profil utilisateur pour validation."""
        if not collected_data:
            return "Aucune information collectée"
        
        summary = "**Votre profil d'assurance**\n\n"
        
        field_labels = {
            'age': 'Âge',
            'sexe': 'Sexe',
            'profession': 'Profession',
            'situation_familiale': 'Situation familiale',
            'maladie_chronique': 'Maladies chroniques',
            'diabetique': 'Diabétique',
            'tension': 'Tension artérielle',
            'maladies_legeres': 'Maladies légères',
            'nombre_beneficiaires': 'Nombre de bénéficiaires',
            'duree_contrat_souhaitee': 'Durée de contrat souhaitée',
            'budget_mensuel': 'Budget mensuel'
        }
        
        for field, label in field_labels.items():
            if field in collected_data:
                value = collected_data[field]
                if field in ['maladie_chronique', 'diabetique', 'tension', 'maladies_legeres']:
                    value = 'Oui' if value else 'Non'
                summary += f"• **{label}** : {value}\n"
        
        return summary
