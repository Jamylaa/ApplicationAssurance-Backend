#!/usr/bin/env python3
"""Test script pour vérifier l'intégration frontend-backend des chatbots séparés. """

import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def test_health_check():
    """Test du endpoint de santé."""
    print("Test du endpoint de santé...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("Health check OK")
            print(f"   Réponse: {response.json()}")
            return True
        else:
            print(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Erreur de connexion: {e}")
        return False

def test_recommendation_chatbot():
    """Test du chatbot de recommandation."""
    print("\nTest du chatbot de recommandation...")
    
    # Démarrer une conversation
    try:
        response = requests.post(f"{BASE_URL}/recommendation-chat/start", 
                              json={"client_id": "test-client"})
        if response.status_code != 200:
            print(f"Échec du démarrage: {response.status_code}")
            return False
            
        data = response.json()
        print("Conversation démarrée")
        print(f"   Message: {data['response'][:50]}...")
        
        # Simuler une conversation
        conversation_history = [
            {"role": "assistant", "content": data['response']},
            {"role": "user", "content": "30"}
        ]
        
        response = requests.post(f"{BASE_URL}/recommendation-chat", json={
            "message": "30",
            "conversation_history": conversation_history,
            "client_id": "test-client"
        })
        
        if response.status_code == 200:
            data = response.json()
            print("Message traité")
            print(f"   Prochaine question: {data.get('next_field', 'N/A')}")
            print(f"   Progression: {data.get('progress', 0)}%")
            return True
        else:
            print(f"Échec du traitement: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Erreur lors du test: {e}")
        return False

def test_admin_chatbot():
    """Test du chatbot d'administration."""
    print("\nTest du chatbot d'administration...")
    
    # Démarrer une conversation
    try:
        response = requests.post(f"{BASE_URL}/admin-chat/start")
        if response.status_code != 200:
            print(f"Échec du démarrage: {response.status_code}")
            return False
            
        data = response.json()
        print("Conversation admin démarrée")
        print(f"   Message: {data['response'][:50]}...")
        
        # Simuler une conversation
        conversation_history = [
            {"role": "assistant", "content": data['response']},
            {"role": "user", "content": "Garantie"}
        ]
        
        response = requests.post(f"{BASE_URL}/admin-chat", json={
            "message": "Garantie",
            "conversation_history": conversation_history,
            "mode": "creation"
        })
        
        if response.status_code == 200:
            data = response.json()
            print("Message admin traité")
            print(f"   Prochain champ: {data.get('next_field', 'N/A')}")
            print(f"   Progression: {data.get('progress', 0)}%")
            return True
        else:
            print(f"Échec du traitement: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Erreur lors du test: {e}")
        return False

def main():
    """Fonction principale de test."""
    print("Lancement des tests d'intégration des chatbots")
    print("=" * 50)
    
    # Attendre que le service démarre
    print("Attente du démarrage du service...")
    time.sleep(2)
    
    # Tests
    tests = [
        ("Health Check", test_health_check),
        ("Recommendation Chatbot", test_recommendation_chatbot),
        ("Admin Chatbot", test_admin_chatbot)
    ]
    
    results = []
    for test_name, test_func in tests:
        result = test_func()
        results.append((test_name, result))
        time.sleep(1)
    
    # Résultats finaux
    print("\n" + "=" * 50)
    print("RÉSULTATS DES TESTS")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "PASSÉ" if result else "ÉCHOUÉ"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(tests)} tests passés")
    
    if passed == len(tests):
        print("Tous les tests sont passés ! L'intégration fonctionne.")
        return True
    else:
        print("Certains tests ont échoué. Vérifiez les logs.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
