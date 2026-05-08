"""
Service de recommandation amélioré avec intégration Google API
Utilise des données réelles et la géolocalisation pour des recommandations pertinentes
"""

import os
import requests
import json
import math
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, date
import sys

# Ajouter les répertoires au chemin Python
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'config'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'chatbot'))

from config.api_config import api_config
from .google_api_service import GoogleAPIService

class EnhancedRecommendationService:
    """Service de recommandation avec données réelles et géolocalisation"""
    
    def __init__(self):
        self.product_service_url = api_config.product_service_url
        self.google_api = GoogleAPIService()
        
        # Poids pour le scoring des recommandations
        self.scoring_weights = {
            'age_match': 0.25,
            'budget_match': 0.20,
            'location_proximity': 0.20,
            'coverage_match': 0.15,
            'family_situation': 0.10,
            'health_profile': 0.10
        }
        
        # Facteurs de risque et tarification
        self.risk_factors = {
            'age_high_risk': 65,  # Âge à risque élevé
            'chronic_diseases_multiplier': 1.3,
            'smoker_multiplier': 1.2,
            'high_blood_pressure_multiplier': 1.15,
            'family_history_multiplier': 1.1
        }
    
    def get_user_location_context(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Récupère le contexte géographique de l'utilisateur"""
        context = {
            'has_location': False,
            'coordinates': None,
            'address': None,
            'nearby_facilities': []
        }
        
        # Vérifier si l'utilisateur a fourni une adresse
        if 'address' in user_data and user_data['address']:
            address = user_data['address']
            
            # Géocoder l'adresse
            geo_result = self.google_api.geocode_address(address)
            
            if 'results' in geo_result and len(geo_result['results']) > 0:
                location = geo_result['results'][0]['geometry']['location']
                formatted_address = geo_result['results'][0].get('formatted_address', address)
                
                context.update({
                    'has_location': True,
                    'coordinates': f"{location['lat']},{location['lng']}",
                    'address': formatted_address
                })
                
                # Rechercher des établissements de santé à proximité
                nearby_places = self.google_api.search_places(
                    "hôpital OR clinique OR pharmacie OR médecin",
                    context['coordinates'],
                    5000  # 5km de rayon
                )
                
                if 'results' in nearby_places:
                    context['nearby_facilities'] = nearby_places['results'][:5]  # Top 5
        
        return context
    
    def calculate_age_risk_score(self, age: int, health_data: Dict[str, Any]) -> float:
        """Calcule un score de risque basé sur l'âge et les données de santé"""
        base_score = 1.0
        
        # Facteur âge
        if age >= self.risk_factors['age_high_risk']:
            age_multiplier = 1 + (age - self.risk_factors['age_high_risk']) * 0.02
            base_score *= age_multiplier
        
        # Facteurs de santé
        if health_data.get('has_chronic_diseases', False):
            base_score *= self.risk_factors['chronic_diseases_multiplier']
        
        if health_data.get('is_smoker', False):
            base_score *= self.risk_factors['smoker_multiplier']
        
        if health_data.get('has_high_blood_pressure', False):
            base_score *= self.risk_factors['high_blood_pressure_multiplier']
        
        if health_data.get('has_family_history', False):
            base_score *= self.risk_factors['family_history_multiplier']
        
        return min(base_score, 3.0)  # Plafonner à 3x le tarif de base
    
    def get_real_pricing_data(self) -> Dict[str, Any]:
        """Récupère les données de tarification réelles depuis l'API produit"""
        try:
            response = requests.get(f"{self.product_service_url}/api/packs", timeout=10)
            if response.status_code == 200:
                packs = response.json()
                
                # Analyser les prix réels
                prices = [pack.get('prixMensuel', 0) for pack in packs if isinstance(pack, dict)]
                
                return {
                    'packs': packs,
                    'price_range': {
                        'min': min(prices) if prices else 0,
                        'max': max(prices) if prices else 0,
                        'average': sum(prices) / len(prices) if prices else 0
                    },
                    'coverage_levels': self._analyze_coverage_levels(packs)
                }
        except Exception as e:
            print(f"Erreur lors de la récupération des données de tarification: {e}")
            return {'packs': [], 'price_range': {'min': 0, 'max': 0, 'average': 0}}
    
    def _analyze_coverage_levels(self, packs: List[Dict]) -> Dict[str, Any]:
        """Analyse les niveaux de couverture disponibles"""
        coverage_stats = {
            'basic': {'count': 0, 'avg_price': 0},
            'premium': {'count': 0, 'avg_price': 0},
            'gold': {'count': 0, 'avg_price': 0}
        }
        
        for pack in packs:
            if isinstance(pack, dict):
                level = pack.get('niveauCouverture', 'basic')
                price = pack.get('prixMensuel', 0)
                
                if level in coverage_stats:
                    coverage_stats[level]['count'] += 1
                    coverage_stats[level]['avg_price'] += price
        
        # Calculer les moyennes
        for level in coverage_stats:
            if coverage_stats[level]['count'] > 0:
                coverage_stats[level]['avg_price'] /= coverage_stats[level]['count']
        
        return coverage_stats
    
    def calculate_budget_match_score(self, user_budget: float, pack_price: float) -> float:
        """Calcule le score de compatibilité budget"""
        if not user_budget or user_budget <= 0:
            return 0.5  # Score neutre si pas de budget
        
        if pack_price <= user_budget:
            # Bonus si le pack est significativement moins cher
            savings_ratio = (user_budget - pack_price) / user_budget
            return min(1.0, 0.7 + savings_ratio * 0.6)
        else:
            # Pénalité si le pack dépasse le budget
            over_budget_ratio = (pack_price - user_budget) / user_budget
            return max(0.0, 1.0 - over_budget_ratio * 2)
    
    def calculate_age_appropriateness(self, user_age: int, pack_data: Dict[str, Any]) -> float:
        """Calcule le score d'adéquation âge-pack"""
        if not user_age:
            return 0.5
        
        # Analyser les conditions d'éligibilité du pack
        conditions = pack_data.get('conditionsEligibilite', {})
        age_min = conditions.get('ageMinimum', 0)
        age_max = conditions.get('ageMaximum', 120)
        
        if age_min <= user_age <= age_max:
            # Score optimal si dans la plage
            return 1.0
        elif user_age < age_min:
            # Pénalité si trop jeune
            diff = age_min - user_age
            return max(0.0, 1.0 - diff * 0.1)
        else:
            # Pénalité si trop âgé
            diff = user_age - age_max
            return max(0.0, 1.0 - diff * 0.05)
    
    def calculate_coverage_match(self, user_health: Dict[str, Any], pack_guarantees: List[str]) -> float:
        """Calcule le score de correspondance de couverture"""
        if not user_health or not pack_guarantees:
            return 0.5
        
        # Besoins basés sur le profil de santé
        needs = []
        
        if user_health.get('has_chronic_diseases', False):
            needs.extend(['MALADIE_CHRONIQUE', 'SOINS_CHRONIQUES'])
        
        if user_health.get('has_dental_issues', False):
            needs.extend(['DENTAIRE', 'SOINS_DENTAIRES'])
        
        if user_health.get('has_vision_issues', False):
            needs.extend(['OPHTALMOLOGIE', 'LUNETTES'])
        
        if user_health.get('needs_hospitalization', False):
            needs.extend(['HOSPITALISATION', 'CHIRURGIE'])
        
        if not needs:
            return 0.8  # Bon score si pas de besoins spécifiques
        
        # Vérifier la correspondance
        matching_needs = sum(1 for need in needs if any(need in garantie for garantie in pack_guarantees))
        total_needs = len(needs)
        
        return matching_needs / total_needs if total_needs > 0 else 0.5
    
    def calculate_family_situation_score(self, user_family: Dict[str, Any], pack_data: Dict[str, Any]) -> float:
        """Calcule le score basé sur la situation familiale"""
        if not user_family:
            return 0.5
        
        situation = user_family.get('situation', 'célibataire')
        nombre_beneficiaires = user_family.get('nombre_beneficiaires', 1)
        
        # Analyser les garanties du pack pour la famille
        pack_guarantees = pack_data.get('garanties', [])
        family_coverage = any('FAMILLE' in str(g) for g in pack_guarantees)
        children_coverage = any('ENFANT' in str(g) for g in pack_guarantees)
        
        score = 0.5  # Score de base
        
        # Bonus pour couverture familiale
        if situation in ['marié', 'mariée'] and family_coverage:
            score += 0.3
        
        # Bonus pour couverture enfants
        if nombre_beneficiaires > 1 and children_coverage:
            score += 0.2
        
        return min(1.0, score)
    
    def calculate_location_proximity_score(self, user_location: Dict[str, Any], pack_data: Dict[str, Any]) -> float:
        """Calcule le score basé sur la proximité géographique"""
        if not user_location.get('has_location', False):
            return 0.5  # Score neutre si pas de localisation
        
        # Vérifier si le pack a une couverture géographique spécifique
        conditions = pack_data.get('conditionsEligibilite', {})
        pack_coverage = conditions.get('couvertureGeographique', 'NATIONAL')
        
        # Score basé sur la proximité des établissements de santé
        nearby_facilities = user_location.get('nearby_facilities', [])
        
        if not nearby_facilities:
            return 0.6  # Score moyen si pas d'infos sur les établissements
        
        # Bonus pour bonne accessibilité aux soins
        facility_score = min(1.0, len(nearby_facilities) / 10)  # Normaliser sur 10 établissements
        
        # Ajuster selon la couverture géographique
        if pack_coverage == 'LOCAL':
            return facility_score * 0.8
        elif pack_coverage == 'INTERNATIONAL':
            return 0.9  # Score élevé pour couverture internationale
        else:
            return facility_score
    
    def calculate_comprehensive_score(self, user_data: Dict[str, Any], pack_data: Dict[str, Any], 
                                  location_context: Dict[str, Any], pricing_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calcule un score de recommandation complet"""
        scores = {}
        
        # Score d'âge
        user_age = user_data.get('age', 30)
        age_score = self.calculate_age_appropriateness(user_age, pack_data)
        scores['age_match'] = age_score
        
        # Score de budget
        user_budget = user_data.get('budget_mensuel', 0)
        pack_price = pack_data.get('prixMensuel', 0)
        budget_score = self.calculate_budget_match_score(user_budget, pack_price)
        scores['budget_match'] = budget_score
        
        # Score de localisation
        location_score = self.calculate_location_proximity_score(location_context, pack_data)
        scores['location_proximity'] = location_score
        
        # Score de couverture santé
        user_health = user_data.get('sante', {})
        pack_guarantees = [g.get('nomGarantie', '') for g in pack_data.get('garanties', [])]
        coverage_score = self.calculate_coverage_match(user_health, pack_guarantees)
        scores['coverage_match'] = coverage_score
        
        # Score situation familiale
        user_family = user_data.get('famille', {})
        family_score = self.calculate_family_situation_score(user_family, pack_data)
        scores['family_situation'] = family_score
        
        # Score profil de santé (risque)
        health_profile_score = 1.0 - (self.calculate_age_risk_score(user_age, user_health) - 1.0) / 2.0
        scores['health_profile'] = health_profile_score
        
        # Score total pondéré
        total_score = sum(
            scores[key] * self.scoring_weights[key] 
            for key in self.scoring_weights
        )
        scores['total_score'] = total_score
        
        return scores
    
    def generate_recommendations(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Génère des recommandations personnalisées"""
        try:
            # Récupérer le contexte géographique
            location_context = self.get_user_location_context(user_data)
            
            # Récupérer les données de tarification réelles
            pricing_data = self.get_real_pricing_data()
            
            # Récupérer tous les packs disponibles
            all_packs = pricing_data.get('packs', [])
            
            # Calculer les scores pour chaque pack
            scored_packs = []
            
            for pack in all_packs:
                if isinstance(pack, dict):
                    scores = self.calculate_comprehensive_score(
                        user_data, pack, location_context, pricing_data
                    )
                    
                    pack_with_score = pack.copy()
                    pack_with_score['recommendation_score'] = scores
                    scored_packs.append(pack_with_score)
            
            # Trier par score de recommandation
            scored_packs.sort(key=lambda x: x['recommendation_score']['total_score'], reverse=True)
            
            # Générer les recommandations finales
            recommendations = []
            
            for i, pack in enumerate(scored_packs[:5]):  # Top 5 recommandations
                score_data = pack['recommendation_score']
                
                recommendation = {
                    'rank': i + 1,
                    'pack': {
                        'id': pack.get('idPack', ''),
                        'name': pack.get('nomPack', ''),
                        'description': pack.get('description', ''),
                        'price': pack.get('prixMensuel', 0),
                        'coverage_level': pack.get('niveauCouverture', 'basic'),
                        'product_id': pack.get('produitId', '')
                    },
                    'scores': score_data,
                    'recommendation_reasons': self._generate_recommendation_reasons(score_data, user_data),
                    'pricing_analysis': self._analyze_pricing_for_user(pack, user_data, pricing_data),
                    'location_benefits': self._get_location_benefits(pack, location_context)
                }
                
                recommendations.append(recommendation)
            
            return {
                'success': True,
                'user_profile': {
                    'age': user_data.get('age', 'Non spécifié'),
                    'budget': user_data.get('budget_mensuel', 'Non spécifié'),
                    'location': location_context.get('address', 'Non spécifiée'),
                    'health_profile': user_data.get('sante', {}),
                    'family_situation': user_data.get('famille', {})
                },
                'recommendations': recommendations,
                'analysis_metadata': {
                    'total_packs_analyzed': len(all_packs),
                    'location_enhanced': location_context.get('has_location', False),
                    'nearby_facilities_count': len(location_context.get('nearby_facilities', [])),
                    'pricing_data_source': 'real_api_data',
                    'scoring_model': 'enhanced_weighted_algorithm',
                    'generated_at': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Erreur lors de la génération des recommandations: {str(e)}",
                'fallback_recommendations': self._get_fallback_recommendations(user_data)
            }
    
    def _generate_recommendation_reasons(self, scores: Dict[str, Any], user_data: Dict[str, Any]) -> List[str]:
        """Génère les raisons des recommandations basées sur les scores"""
        reasons = []
        
        if scores.get('age_match', 0) > 0.8:
            reasons.append("Adapté à votre tranche d'âge")
        
        if scores.get('budget_match', 0) > 0.8:
            reasons.append("Respecte votre budget mensuel")
        
        if scores.get('location_proximity', 0) > 0.7:
            reasons.append("Bonne couverture dans votre région")
        
        if scores.get('coverage_match', 0) > 0.7:
            reasons.append("Couverture santé adaptée à vos besoins")
        
        if scores.get('family_situation', 0) > 0.7:
            reasons.append("Avantages pour votre situation familiale")
        
        if not reasons:
            reasons.append("Recommandation basée sur votre profil global")
        
        return reasons
    
    def _analyze_pricing_for_user(self, pack: Dict[str, Any], user_data: Dict[str, Any], 
                                pricing_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse la tarification pour l'utilisateur"""
        pack_price = pack.get('prixMensuel', 0)
        user_budget = user_data.get('budget_mensuel', 0)
        price_range = pricing_data.get('price_range', {})
        
        analysis = {
            'price_position': 'moyenne',
            'budget_fit': 'inconnu',
            'value_score': 0.5
        }
        
        if price_range['min'] > 0 and price_range['max'] > 0:
            # Position dans la gamme de prix
            price_percentile = (pack_price - price_range['min']) / (price_range['max'] - price_range['min'])
            
            if price_percentile < 0.33:
                analysis['price_position'] = 'économique'
                analysis['value_score'] = 0.9
            elif price_percentile < 0.67:
                analysis['price_position'] = 'moyenne'
                analysis['value_score'] = 0.7
            else:
                analysis['price_position'] = 'premium'
                analysis['value_score'] = 0.6
        
        # Adéquation budget
        if user_budget > 0:
            if pack_price <= user_budget * 0.8:
                analysis['budget_fit'] = 'très bon'
                analysis['value_score'] += 0.2
            elif pack_price <= user_budget:
                analysis['budget_fit'] = 'bon'
                analysis['value_score'] += 0.1
            else:
                analysis['budget_fit'] = 'dépasse le budget'
                analysis['value_score'] -= 0.2
        
        return analysis
    
    def _get_location_benefits(self, pack: Dict[str, Any], location_context: Dict[str, Any]) -> List[str]:
        """Récupère les bénéfices liés à la localisation"""
        benefits = []
        
        if not location_context.get('has_location', False):
            return ["Spécifiez votre adresse pour des recommandations localisées"]
        
        nearby_facilities = location_context.get('nearby_facilities', [])
        
        # Analyser les types d'établissements à proximité
        facility_types = [f.get('types', []) for f in nearby_facilities]
        flat_types = [item for sublist in facility_types for item in sublist]
        
        if 'hospital' in str(flat_types).lower():
            benefits.append("Proximité d'établissements hospitaliers")
        
        if 'pharmacy' in str(flat_types).lower():
            benefits.append("Accès facile aux pharmacies")
        
        if 'doctor' in str(flat_types).lower():
            benefits.append("Présence de médecins à proximité")
        
        # Vérifier la couverture géographique du pack
        conditions = pack.get('conditionsEligibilite', {})
        coverage = conditions.get('couvertureGeographique', 'NATIONAL')
        
        if coverage == 'LOCAL' and len(nearby_facilities) > 5:
            benefits.append("Couverture locale optimisée pour votre région")
        elif coverage == 'INTERNATIONAL':
            benefits.append("Couverture internationale complète")
        
        return benefits
    
    def _get_fallback_recommendations(self, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Recommandations de secours si l'API n'est pas disponible"""
        # Recommandations basiques basées sur l'âge et le budget
        age = user_data.get('age', 30)
        budget = user_data.get('budget_mensuel', 200)
        
        fallback_recs = []
        
        if age < 30:
            if budget < 100:
                fallback_recs.append({
                    'type': 'basic_young',
                    'description': 'Pack essentiel pour jeunes',
                    'estimated_price': 50
                })
            else:
                fallback_recs.append({
                    'type': 'standard_young',
                    'description': 'Pack complet pour jeunes actifs',
                    'estimated_price': 120
                })
        elif age < 50:
            if budget < 150:
                fallback_recs.append({
                    'type': 'family_basic',
                    'description': 'Pack familial économique',
                    'estimated_price': 100
                })
            else:
                fallback_recs.append({
                    'type': 'family_comprehensive',
                    'description': 'Pack familial complet',
                    'estimated_price': 180
                })
        else:
            fallback_recs.append({
                'type': 'senior_comprehensive',
                'description': 'Pack senior avec couverture étendue',
                'estimated_price': 200
            })
        
        return fallback_recs

# Instance globale du service amélioré
enhanced_recommendation_service = EnhancedRecommendationService()
