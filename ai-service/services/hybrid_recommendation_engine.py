"""
Moteur de recommandation hybride intelligent pour PFE Vermeg
Combine prompt unique et conversation interactive
"""

import os
import requests
import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'config'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))

from config.api_config import api_config
from services.enhanced_recommendation_service import enhanced_recommendation_service
from services.google_api_service import google_api_service

class HybridRecommendationEngine:
    """Moteur hybride intelligent pour recommandations d'assurance"""
    
    def __init__(self):
        self.enhanced_service = enhanced_recommendation_service
        self.google_api = google_api_service
        
        # Schéma de données client complet
        self.client_schema = {
            "profil_personnel": {
                "age": {"type": "int", "required": True, "min": 18, "max": 100},
                "sexe": {"type": "choice", "required": True, "options": ["Homme", "Femme"]},
                "profession": {"type": "text", "required": True},
                "situation_familiale": {"type": "choice", "required": True, 
                                   "options": ["Célibataire", "Marié", "Divorcé", "Veuf"]},
                "nombre_enfants": {"type": "int", "required": False, "min": 0, "max": 10},
                "revenu_mensuel": {"type": "float", "required": False, "min": 0}
            },
            "contexte_geographique": {
                "adresse": {"type": "text", "required": False},
                "code_postal": {"type": "text", "required": False},
                "ville": {"type": "text", "required": False},
                "rayon_deplacement": {"type": "int", "required": False, "min": 1, "max": 100}
            },
            "besoins_assurance": {
                "type_assurance": {"type": "choice", "required": True, 
                                 "options": ["Santé", "Habitation", "Auto", "Vie", "Multirisque"]},
                "budget_mensuel": {"type": "float", "required": True, "min": 10},
                "priorites": {"type": "multi_choice", "required": False,
                            "options": ["Prix", "Couverture", "Rapidité", "Conseil", "Digital"]},
                "duree_contrat": {"type": "choice", "required": False,
                                "options": ["1 an", "2 ans", "3 ans", "5 ans", "Illimité"]}
            },
            "profil_sante": {
                "antecedents_medicaux": {"type": "boolean", "required": False},
                "maladies_chroniques": {"type": "boolean", "required": False},
                "fumeur": {"type": "boolean", "required": False},
                "sports_pratiques": {"type": "multi_choice", "required": False,
                                   "options": ["Aucun", "Course", "Natation", "Cyclisme", "Fitness", "Autres"]},
                "visites_annuelles": {"type": "int", "required": False, "min": 0, "max": 20}
            },
            "contraintes_specifiques": {
                "exclusions": {"type": "multi_choice", "required": False,
                             "options": ["Dentaire", "Optique", "Hospitalisation", "Maternité", "Sports"]},
                "preferences_assureur": {"type": "text", "required": False},
                "mode_paiement": {"type": "choice", "required": False,
                                 "options": ["Mensuel", "Trimestriel", "Annuel"]},
                "date_effet_souhaitee": {"type": "date", "required": False}
            }
        }
    
    def analyze_input_completeness(self, client_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse la complétude des données client"""
        analysis = {
            "completion_rate": 0,
            "missing_fields": [],
            "missing_categories": [],
            "can_proceed_with_single_prompt": False,
            "needs_conversation": False,
            "priority_questions": []
        }
        
        total_fields = 0
        completed_fields = 0
        
        for category, fields in self.client_schema.items():
            category_complete = True
            category_missing = []
            
            for field_name, field_config in fields.items():
                total_fields += 1
                
                if field_config["required"] and field_name not in client_data:
                    category_complete = False
                    category_missing.append(field_name)
                    analysis["missing_fields"].append(f"{category}.{field_name}")
                elif field_name in client_data and client_data[field_name]:
                    completed_fields += 1
            
            if not category_complete:
                analysis["missing_categories"].append(category)
                analysis["needs_conversation"] = True
        
        analysis["completion_rate"] = completed_fields / total_fields if total_fields > 0 else 0
        
        # Logique de décision
        analysis["can_proceed_with_single_prompt"] = (
            analysis["completion_rate"] >= 0.7 and  # 70% minimum
            "profil_personnel.age" not in analysis["missing_fields"] and
            "profil_personnel.sexe" not in analysis["missing_fields"] and
            "besoins_assurance.type_assurance" not in analysis["missing_fields"] and
            "besoins_assurance.budget_mensuel" not in analysis["missing_fields"]
        )
        
        # Générer les questions prioritaires
        analysis["priority_questions"] = self._generate_priority_questions(
            analysis["missing_categories"], analysis["missing_fields"]
        )
        
        return analysis
    
    def _generate_priority_questions(self, missing_categories: List[str], missing_fields: List[str]) -> List[Dict[str, Any]]:
        """Génère les questions prioritaires basées sur les champs manquants"""
        questions = []
        
        # Questions par ordre de priorité métier
        priority_mapping = {
            "profil_personnel.age": {
                "question": "Quel est votre âge ?",
                "type": "int",
                "validation": "between 18 and 100",
                "importance": "critique"
            },
            "profil_personnel.sexe": {
                "question": "Quel est votre sexe ?",
                "type": "choice",
                "options": ["Homme", "Femme"],
                "importance": "critique"
            },
            "besoins_assurance.type_assurance": {
                "question": "Quel type d'assurance recherchez-vous ?",
                "type": "choice",
                "options": ["Santé", "Habitation", "Auto", "Vie", "Multirisque"],
                "importance": "critique"
            },
            "besoins_assurance.budget_mensuel": {
                "question": "Quel est votre budget mensuel pour l'assurance ?",
                "type": "float",
                "validation": ">= 10",
                "importance": "critique"
            },
            "profil_personnel.profession": {
                "question": "Quelle est votre profession ?",
                "type": "text",
                "importance": "haute"
            },
            "profil_personnel.situation_familiale": {
                "question": "Quelle est votre situation familiale ?",
                "type": "choice",
                "options": ["Célibataire", "Marié", "Divorcé", "Veuf"],
                "importance": "haute"
            },
            "contexte_geographique.adresse": {
                "question": "Quelle est votre adresse complète ?",
                "type": "text",
                "importance": "moyenne"
            },
            "profil_sante.antecedents_medicaux": {
                "question": "Avez-vous des antécédents médicaux importants ?",
                "type": "boolean",
                "importance": "moyenne"
            }
        }
        
        for field in missing_fields:
            if field in priority_mapping:
                questions.append({
                    "field": field,
                    **priority_mapping[field]
                })
        
        # Trier par importance
        importance_order = {"critique": 0, "haute": 1, "moyenne": 2, "basse": 3}
        questions.sort(key=lambda x: importance_order.get(x.get("importance", "basse"), 3))
        
        return questions[:5]  # Limiter à 5 questions maximum
    
    def process_single_prompt(self, prompt: str) -> Dict[str, Any]:
        """Traite un prompt unique complet"""
        try:
            # Parser le prompt (JSON ou texte naturel)
            parsed_data = self._parse_comprehensive_prompt(prompt)
            
            # Enrichir avec contexte géographique si adresse fournie
            if "adresse" in parsed_data:
                geo_context = self.google_api.geocode_address(parsed_data["adresse"])
                if "results" in geo_context and len(geo_context["results"]) > 0:
                    location = geo_context["results"][0]["geometry"]["location"]
                    parsed_data["coordinates"] = {
                        "lat": location["lat"],
                        "lng": location["lng"]
                    }
                    parsed_data["formatted_address"] = geo_context["results"][0]["formatted_address"]
            
            # Générer les recommandations
            recommendations = self.enhanced_service.generate_recommendations(parsed_data)
            
            return {
                "success": True,
                "mode": "single_prompt",
                "parsed_data": parsed_data,
                "recommendations": recommendations,
                "processing_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Erreur lors du traitement du prompt: {str(e)}",
                "mode": "single_prompt"
            }
    
    def start_conversation(self, initial_data: Dict[str, Any]) -> Dict[str, Any]:
        """Démarre une conversation pour collecter les informations manquantes"""
        completeness = self.analyze_input_completeness(initial_data)
        
        if completeness["can_proceed_with_single_prompt"]:
            # Données suffisantes, traiter directement
            return self.process_single_prompt(initial_data)
        
        # Démarrer la conversation
        return {
            "success": True,
            "mode": "conversation",
            "session_id": f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "current_data": initial_data,
            "completeness_analysis": completeness,
            "next_question": completeness["priority_questions"][0] if completeness["priority_questions"] else None,
            "estimated_questions_remaining": len(completeness["priority_questions"]),
            "message": self._generate_welcome_message(completeness)
        }
    
    def process_conversation_response(self, session_data: Dict[str, Any], user_response: str) -> Dict[str, Any]:
        """Traite une réponse dans la conversation"""
        try:
            current_data = session_data["current_data"]
            current_question = session_data["next_question"]
            
            # Parser et valider la réponse
            parsed_response = self._parse_user_response(user_response, current_question)
            
            if parsed_response["valid"]:
                # Ajouter la réponse aux données
                field_name = current_question["field"]
                current_data[field_name.split(".")[-1]] = parsed_response["value"]
                
                # Ré-analyser la complétude
                new_completeness = self.analyze_input_completeness(current_data)
                
                if new_completeness["can_proceed_with_single_prompt"]:
                    # Données complètes, générer les recommandations
                    recommendations = self.enhanced_service.generate_recommendations(current_data)
                    
                    return {
                        "success": True,
                        "mode": "conversation_completed",
                        "session_data": session_data,
                        "updated_data": current_data,
                        "recommendations": recommendations,
                        "message": "Parfait ! J'ai maintenant toutes les informations nécessaires pour vous recommander les meilleures offres."
                    }
                else:
                    # Continuer la conversation
                    next_question = new_completeness["priority_questions"][0] if new_completeness["priority_questions"] else None
                    
                    return {
                        "success": True,
                        "mode": "conversation_continue",
                        "session_data": session_data,
                        "updated_data": current_data,
                        "completeness_analysis": new_completeness,
                        "next_question": next_question,
                        "completion_rate": new_completeness["completion_rate"],
                        "message": self._generate_acknowledgment_message(current_question, parsed_response["value"])
                    }
            else:
                # Réponse invalide, poser la question différemment
                return {
                    "success": False,
                    "mode": "conversation_retry",
                    "session_data": session_data,
                    "next_question": self._rephrase_question(current_question),
                    "error": parsed_response["error"],
                    "message": f"Je n'ai pas bien compris. {self._rephrase_question(current_question)['question']}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Erreur lors du traitement de la réponse: {str(e)}",
                "mode": "conversation_error"
            }
    
    def _parse_comprehensive_prompt(self, prompt: str) -> Dict[str, Any]:
        """Parse un prompt complet (JSON ou texte naturel)"""
        try:
            # Essayer JSON d'abord
            if prompt.strip().startswith('{'):
                return json.loads(prompt)
            
            # Parser texte naturel
            return self._parse_natural_language_prompt(prompt)
            
        except Exception as e:
            raise ValueError(f"Erreur de parsing du prompt: {str(e)}")
    
    def _parse_natural_language_prompt(self, prompt: str) -> Dict[str, Any]:
        """Parse un prompt en langage naturel"""
        import re
        
        data = {}
        
        # Extraire l'âge
        age_match = re.search(r'(\d+)\s*ans?', prompt.lower())
        if age_match:
            data["age"] = int(age_match.group(1))
        
        # Extraire le sexe
        if any(word in prompt.lower() for word in ["homme", "masculin"]):
            data["sexe"] = "Homme"
        elif any(word in prompt.lower() for word in ["femme", "féminin"]):
            data["sexe"] = "Femme"
        
        # Extraire le type d'assurance
        insurance_types = ["santé", "habitation", "auto", "vie", "multirisque"]
        for ins_type in insurance_types:
            if ins_type in prompt.lower():
                data["type_assurance"] = ins_type.title()
                break
        
        # Extraire le budget
        budget_match = re.search(r'budget\s*[:=]?\s*(\d+(?:\.\d+)?)\s*?e?ur?', prompt.lower())
        if budget_match:
            data["budget_mensuel"] = float(budget_match.group(1))
        
        # Extraire l'adresse
        address_patterns = [
            r'adresse\s*[:=]?\s*([^,\.]+)',
            r'à\s*([^,\.]+)',
            r'(\d+\s+[^,\.]+\s+(?:rue|avenue|boulevard|place)[^,\.]*)'
        ]
        
        for pattern in address_patterns:
            match = re.search(pattern, prompt.lower())
            if match:
                data["adresse"] = match.group(1).strip()
                break
        
        return data
    
    def _parse_user_response(self, response: str, question: Dict[str, Any]) -> Dict[str, Any]:
        """Parse et valide la réponse utilisateur"""
        question_type = question["type"]
        
        try:
            if question_type == "int":
                value = int(response.strip())
                if "validation" in question:
                    if "between" in question["validation"]:
                        min_val, max_val = map(int, question["validation"].split("between")[1].strip().split("and"))
                        if not (min_val <= value <= max_val):
                            return {"valid": False, "error": f"Veuillez entrer une valeur entre {min_val} et {max_val}"}
                return {"valid": True, "value": value}
                
            elif question_type == "float":
                value = float(response.strip().replace(',', '.'))
                if "validation" in question and ">=" in question["validation"]:
                    min_val = float(question["validation"].split(">=")[1].strip())
                    if value < min_val:
                        return {"valid": False, "error": f"Veuillez entrer une valeur supérieure ou égale à {min_val}"}
                return {"valid": True, "value": value}
                
            elif question_type == "choice":
                response_clean = response.strip().title()
                if response_clean in question["options"]:
                    return {"valid": True, "value": response_clean}
                else:
                    return {"valid": False, "error": f"Veuillez choisir parmi: {', '.join(question['options'])}"}
                
            elif question_type == "text":
                if len(response.strip()) >= 2:
                    return {"valid": True, "value": response.strip()}
                else:
                    return {"valid": False, "error": "Veuillez entrer au moins 2 caractères"}
                
            elif question_type == "boolean":
                response_lower = response.lower().strip()
                if response_lower in ["oui", "yes", "true", "1"]:
                    return {"valid": True, "value": True}
                elif response_lower in ["non", "no", "false", "0"]:
                    return {"valid": True, "value": False}
                else:
                    return {"valid": False, "error": "Veuillez répondre par oui ou non"}
                
        except ValueError:
            return {"valid": False, "error": "Format invalide"}
        
        return {"valid": False, "error": "Type de question non géré"}
    
    def _generate_welcome_message(self, completeness: Dict[str, Any]) -> str:
        """Génère le message de bienvenue pour la conversation"""
        completion_rate = completeness["completion_rate"]
        
        if completion_rate == 0:
            return ("Bonjour ! Je suis votre conseiller assurance intelligent. "
                   "Pour vous recommander les meilleures offres, j'ai besoin de quelques informations. "
                   "Commençons par les plus importantes.")
        elif completion_rate < 0.3:
            return ("Merci pour ces informations. J'ai encore quelques questions importantes "
                   "pour vous proposer les recommandations les plus pertinentes.")
        else:
            return ("Excellent ! J'ai déjà une bonne partie des informations. "
                   "Quelques questions supplémentaires pour affiner mes recommandations.")
    
    def _generate_acknowledgment_message(self, question: Dict[str, Any], value: Any) -> str:
        """Génère un message d'acquittement"""
        field_name = question["field"].split(".")[-1]
        
        acknowledgments = {
            "age": f"Merci ! {value} ans, noté.",
            "sexe": f"Parfait, bien noté.",
            "profession": f"Intéressant, {value}.",
            "budget_mensuel": f"Budget de {value}EUR/mois, compris.",
            "type_assurance": f"Assurance {value}, excellente choix."
        }
        
        return acknowledgments.get(field_name, "Parfait, bien noté.")
    
    def _rephrase_question(self, question: Dict[str, Any]) -> Dict[str, Any]:
        """Reformule une question pour plus de clarté"""
        rephrased = question.copy()
        
        if question["field"] == "profil_personnel.age":
            rephrased["question"] = "Pouvez-vous me donner votre âge en chiffres (ex: 35) ?"
        elif question["field"] == "besoins_assurance.budget_mensuel":
            rephrased["question"] = "Quel budget mensuel pouvez-vous allouer à l'assurance (en euros) ?"
        elif question["field"] == "contexte_geographique.adresse":
            rephrased["question"] = "Quelle est votre adresse complète pour analyser les offres locales ?"
        
        return rephrased

# Instance globale du moteur hybride
hybrid_recommendation_engine = HybridRecommendationEngine()
