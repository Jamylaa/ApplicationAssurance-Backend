"""
Services package for AI service
"""

from .google_api_service import GoogleAPIService
from .enhanced_recommendation_service import EnhancedRecommendationService
from .hybrid_recommendation_engine import HybridRecommendationEngine

# Instances globales pour éviter les imports circulaires
google_api_service = GoogleAPIService()
enhanced_recommendation_service = EnhancedRecommendationService()
hybrid_recommendation_engine = HybridRecommendationEngine()
