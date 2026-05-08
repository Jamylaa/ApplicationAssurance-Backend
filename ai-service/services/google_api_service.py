"""
Service d'intégration avec l'API Google
Utilise la clé API configurée pour les fonctionnalités Google
"""
import os
import requests
import json
from typing import Dict, Any, Optional, List
from config.api_config import api_config

class GoogleAPIService:
    """Service pour interagir avec les API Google"""
    
    def __init__(self):
        self.api_key = api_config.get_google_api_key()
        self.base_url = "https://www.googleapis.com"
    
    def is_configured(self) -> bool:
        """Vérifie si le service est correctement configuré"""
        return api_config.is_google_api_configured()
    
    def get_headers(self) -> Dict[str, str]:
        """Retourne les en-têtes pour les requêtes API"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
    
    # API Google Places (pour les adresses, localisations)
    def search_places(self, query: str, location: Optional[str] = None, radius: Optional[int] = None) -> Dict[str, Any]:
        """
        Recherche des lieux via Google Places API
        """
        if not self.is_configured():
            return {"error": "API Google non configurée"}
        
        url = f"{self.base_url}/maps/api/place/textsearch/json"
        params = {
            "query": query,
            "key": self.api_key
        }
        
        if location:
            params["location"] = location
        if radius:
            params["radius"] = radius
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Erreur API: {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": f"Erreur de connexion: {str(e)}"}
    
    def get_place_details(self, place_id: str) -> Dict[str, Any]:
        """
        Récupère les détails d'un lieu spécifique
        """
        if not self.is_configured():
            return {"error": "API Google non configurée"}
        
        url = f"{self.base_url}/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "key": self.api_key,
            "fields": "name,formatted_address,geometry,opening_hours,rating,reviews"
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Erreur API: {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": f"Erreur de connexion: {str(e)}"}
    
    # API Google Geocoding
    def geocode_address(self, address: str) -> Dict[str, Any]:
        """
        Convertit une adresse en coordonnées GPS
        """
        if not self.is_configured():
            return {"error": "API Google non configurée"}
        
        url = f"{self.base_url}/maps/api/geocode/json"
        params = {
            "address": address,
            "key": self.api_key
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Erreur API: {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": f"Erreur de connexion: {str(e)}"}
    
    def reverse_geocode(self, lat: float, lng: float) -> Dict[str, Any]:
        """
        Convertit des coordonnées GPS en adresse
        """
        if not self.is_configured():
            return {"error": "API Google non configurée"}
        
        url = f"{self.base_url}/maps/api/geocode/json"
        params = {
            "latlng": f"{lat},{lng}",
            "key": self.api_key
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Erreur API: {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": f"Erreur de connexion: {str(e)}"}
    
    # API Google Distance Matrix
    def calculate_distance_matrix(self, origins: List[str], destinations: List[str], mode: str = "driving") -> Dict[str, Any]:
        """
        Calcule une matrice de distances entre plusieurs points
        """
        if not self.is_configured():
            return {"error": "API Google non configurée"}
        
        url = f"{self.base_url}/maps/api/distancematrix/json"
        params = {
            "origins": "|".join(origins),
            "destinations": "|".join(destinations),
            "mode": mode,
            "key": self.api_key
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Erreur API: {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": f"Erreur de connexion: {str(e)}"}
    
    # API Google Directions
    def get_directions(self, origin: str, destination: str, mode: str = "driving", alternatives: bool = False) -> Dict[str, Any]:
        """
        Récupère les itinéraires entre deux points
        """
        if not self.is_configured():
            return {"error": "API Google non configurée"}
        
        url = f"{self.base_url}/maps/api/directions/json"
        params = {
            "origin": origin,
            "destination": destination,
            "mode": mode,
            "alternatives": "true" if alternatives else "false",
            "key": self.api_key
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Erreur API: {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": f"Erreur de connexion: {str(e)}"}
    
    # API Google Translate (si nécessaire)
    def translate_text(self, text: str, target_language: str, source_language: Optional[str] = None) -> Dict[str, Any]:
        """
        Traduit du texte via Google Translate API
        """
        if not self.is_configured():
            return {"error": "API Google non configurée"}
        
        url = f"{self.base_url}/language/translate/v2"
        params = {
            "key": self.api_key,
            "q": text,
            "target": target_language
        }
        
        if source_language:
            params["source"] = source_language
        
        try:
            response = requests.post(url, data=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Erreur API: {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": f"Erreur de connexion: {str(e)}"}
    
    def validate_api_key(self) -> Dict[str, Any]:
        """
        Valide si la clé API fonctionne correctement
        """
        if not self.is_configured():
            return {"valid": False, "error": "Clé API non configurée"}
        
        # Test simple avec geocoding
        test_result = self.geocode_address("Paris, France")
        
        if "error" in test_result:
            return {"valid": False, "error": test_result["error"]}
        elif "status" in test_result and test_result["status"] == "OK":
            return {"valid": True, "message": "Clé API valide"}
        else:
            return {"valid": False, "error": "Réponse inattendue de l'API"}
    
    def get_usage_info(self) -> Dict[str, Any]:
        """
        Récupère les informations d'utilisation de l'API (si disponible)
        """
        if not self.is_configured():
            return {"error": "API Google non configurée"}
        
        # Note: Ceci nécessiterait l'API Google Cloud Platform billing
        # Pour l'instant, retourne les informations de base
        return {
            "api_key_configured": True,
            "api_key_length": len(self.api_key) if self.api_key else 0,
            "available_apis": [
                "Places API",
                "Geocoding API", 
                "Distance Matrix API",
                "Directions API",
                "Translate API"
            ]
        }

# Instance globale du service
google_api_service = GoogleAPIService()
