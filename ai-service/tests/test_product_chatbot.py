"""
Test du ProductChatbot - State Machine Robuste
Démontre la fiabilité de la collecte de données sans décalage.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chatbot.product_chatbot import ProductChatbot

def test_complete_product_creation():
    """Test une création complète de produit"""
    print("[TEST] Création complète de produit")
    
    chatbot = ProductChatbot()
    
    # Message de bienvenue
    response = chatbot.get_welcome_message()
    print(f"Bot: {response['response']}")
    assert response['state'] == 'collecting'
    assert response['current_field'] == 'nom_produit'
    
    # Simuler les réponses utilisateur dans le bon ordre
    user_inputs = [
        ("Assurance Santé Premium", "nom_produit"),
        ("Une assurance complète pour les professionnels avec couverture étendue", "description"),
        ("GAR001,GAR002,GAR003", "garanties_ids"),
        ("250.50", "prix_base"),
        ("18", "age_min"),
        ("65", "age_max"),
        ("oui", "maladie_chronique_autorisee"),
        ("non", "diabetique_autorise"),
        ("oui", "actif")
    ]
    
    for user_input, expected_field in user_inputs:
        print(f"User: {user_input}")
        response = chatbot.process_message(user_input)
        print(f"Bot: {response['response']}")
        
        # Vérifier que le champ attendu a bien été collecté
        if expected_field in chatbot.collected_data:
            print(f"[OK] {expected_field} = {chatbot.collected_data[expected_field]}")
        else:
            print(f"[FAILED] Champ {expected_field} non trouvé dans les données collectées")
            return False
    
    # Confirmation finale
    print("User: oui")
    response = chatbot.process_message("oui")
    print(f"Bot: {response['response']}")
    
    # Vérification finale
    expected_data = {
        'nom_produit': 'Assurance Santé Premium',
        'description': 'Une assurance complète pour les professionnels avec couverture étendue',
        'garanties_ids': 'GAR001,GAR002,GAR003',
        'prix_base': 250.50,
        'age_min': 18,
        'age_max': 65,
        'maladie_chronique_autorisee': True,
        'diabetique_autorise': False,
        'actif': True
    }
    
    print("\n[SUMMARY] Verification des donnees collectees:")
    for key, expected_value in expected_data.items():
        actual_value = chatbot.collected_data.get(key)
        if actual_value == expected_value:
            print(f"[OK] {key}: {actual_value}")
        else:
            print(f"[FAILED] {key}: attendu={expected_value}, obtenu={actual_value}")
            return False
    
    print("\n[SUCCESS] Test reussi ! Aucun decalage de champs detecte.")
    return True

def test_validation_errors():
    """Test la gestion des erreurs de validation"""
    print("\n[TEST] Gestion des erreurs de validation")
    
    chatbot = ProductChatbot()
    response = chatbot.get_welcome_message()
    
    # Test avec un nom vide
    print("User: (vide)")
    response = chatbot.process_message("")
    print(f"Bot: {response['response']}")
    assert "ne peut pas être vide" in response['response']
    assert response['current_field'] == 'nom_produit'  # Toujours sur le même champ
    
    # Test avec une description trop courte
    print("User: Produit")
    response = chatbot.process_message("Produit")
    print(f"Bot: {response['response']}")
    assert "au moins 10 caractères" in response['response']
    assert response['current_field'] == 'description'
    
    # Test avec un âge invalide
    # Continuer avec des valeurs valides pour atteindre le champ age
    chatbot.process_message("Assurance Test Complet")
    chatbot.process_message("Description valide pour le test")
    chatbot.process_message("GAR001")
    chatbot.process_message("100")
    chatbot.process_message("25")
    
    print("User: 150")  # Âge max invalide (doit être > age_min)
    response = chatbot.process_message("150")
    print(f"Bot: {response['response']}")
    assert "supérieur à l'âge minimum" in response['response']
    
    print("[OK] Test de validation reussi")
    return True

def test_correction_flow():
    """Test le flux de correction"""
    print("\n[TEST] Flux de correction")
    
    chatbot = ProductChatbot()
    response = chatbot.get_welcome_message()
    
    # Remplir tous les champs
    inputs = [
        "Produit Test",
        "Description du produit de test",
        "GAR001",
        "200",
        "18",
        "60",
        "oui",
        "oui", 
        "oui"
    ]
    for user_input in inputs:
        chatbot.process_message(user_input)
    
    # Demander une correction
    print("User: non")  # Refuser la confirmation
    response = chatbot.process_message("non")
    print(f"Bot: {response['response']}")
    assert response['state'] == 'correction'
    
    # Corriger le prix
    print("User: prix_base")
    response = chatbot.process_message("prix_base")
    print(f"Bot: {response['response']}")
    
    print("User: 299.99")
    response = chatbot.process_message("299.99")
    print(f"Bot: {response['response']}")
    
    # Vérifier la correction
    assert chatbot.collected_data['prix_base'] == 299.99
    print("[OK] Correction appliquée avec succès")
    
    return True

def main():
    """Exécute tous les tests"""
    print("[START] Lancement des tests du ProductChatbot\n")
    
    try:
        success = True
        success &= test_complete_product_creation()
        success &= test_validation_errors()
        success &= test_correction_flow()
        
        if success:
            print("\n[SUCCESS] TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !")
            print("Le chatbot garantit une collecte de données fiable sans décalage.")
        else:
            print("\n[FAILED] Certains tests ont échoué.")
            return False
            
    except Exception as e:
        print(f"\n[!] Erreur inattendue: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)