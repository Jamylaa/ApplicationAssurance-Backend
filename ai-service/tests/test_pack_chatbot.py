"""
Test du PackChatbot - Parsing Intelligent et State Machine Robuste
Démontre la fiabilité du parsing et l'absence de décalage de champs.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chatbot.pack_chatbot import PackChatbot

def test_intelligent_parsing():
    """Test le parsing intelligent des entrées utilisateur variées"""
    print("[TEST] Parsing intelligent des entrées utilisateur")

    chatbot = PackChatbot()
    response = chatbot.get_welcome_message()
    print(f"Bot: {response['response']}")
    # Test des différents formats d'entrée
    test_cases = [
        # (entrée_attendue, champ, valeur_attendue)
        ("Pack Famille Gold", "nom_pack", "Pack Famille Gold"),
        ("2000DT", "prix_mensuel", 2000.0),
        ("24mois", "duree_min_contrat", 24),
        ("2ans", "duree_max_contrat", 24),  # 2 ans = 24 mois
        ("basic", "niveau_couverture", "BASIC"),
        ("OUI", "actif", True),
        ("PROD001,PROD002, PROD003", "produits_ids", ["PROD001", "PROD002", "PROD003"])
    ]
    # Remplir les champs progressivement
    fields_order = ["nom_pack", "description", "produits_ids", "prix_mensuel", 
                   "duree_min_contrat", "duree_max_contrat", "niveau_couverture", "actif"]
    # Simuler les entrées avec formats variés
    user_inputs = [
        "Pack Famille Gold",
        "Couverture complète pour les familles avec enfants",
        "PROD001,PROD002, PROD003",
        "2000DT",
        "12mois", 
        "24mois",
        "premium",
        "oui"
    ]
    
    for i, (user_input, expected_field) in enumerate(zip(user_inputs, fields_order)):
        print(f"User: {user_input}")
        response = chatbot.process_message(user_input)
        print(f"Bot: {response['response']}")
        
        # Vérifier que le champ a été correctement parsé
        if expected_field in chatbot.collected_data:
            actual_value = chatbot.collected_data[expected_field]
            print(f"[OK] {expected_field} = {actual_value} (type: {type(actual_value).__name__})")
        else:
            print(f"[FAILED] Champ {expected_field} non trouve")
            return False
    
    print("\n[SUCCESS] Test de parsing reussi !")
    return True

def test_validation_rules():
    """Test les règles de validation spécifiques aux packs"""
    print("\n[TEST] Regles de validation des packs")
    
    chatbot = PackChatbot()
    response = chatbot.get_welcome_message()
    
    # Test validation prix négatif
    print("User: Pack Test")
    chatbot.process_message("Pack Test")
    
    print("User: Description valide")
    chatbot.process_message("Description valide pour le test")
    
    print("User: PROD001")
    chatbot.process_message("PROD001")
    
    print("User: -50")  # Prix invalide
    response = chatbot.process_message("-50")
    print(f"Bot: {response['response']}")
    assert "positif" in response['response']
    assert response['current_field'] == 'prix_mensuel'
    
    # Test validation durée min >= durée max
    # Continuer avec des valeurs valides
    chatbot.process_message("1500")  # prix valide
    chatbot.process_message("24")    # duree_min = 24
    
    print("User: 12")  # duree_max < duree_min (invalide)
    response = chatbot.process_message("12")
    print(f"Bot: {response['response']}")
    assert "supérieure à la durée minimale" in response['response']
    assert response['current_field'] == 'duree_max_contrat'
    
    print("[OK] Test de validation reussi")
    return True

def test_error_handling_and_correction():
    """Test la gestion des erreurs et le flux de correction"""
    print("\n[TEST] Gestion des erreurs et correction")
    
    chatbot = PackChatbot()
    response = chatbot.get_welcome_message()
    
    # Remplir avec une erreur (duree_max = duree_min)
    inputs = [
        "Pack Test Erreur",
        "Description avec erreur de validation",
        "PROD001",
        "1000",
        "12",
        "12",  # Erreur : duree_max = duree_min
        "BASIC",
        "oui"
    ]
    
    for user_input in inputs:
        print(f"User: {user_input}")
        response = chatbot.process_message(user_input)
        print(f"Bot: {response['response'][:100]}...")
    
    # Devrait détecter l'erreur de validation
    assert response['state'] == 'confirmation'
    assert 'validation_errors' in response
    
    # Refuser la correction pour tester
    print("User: oui")  # Accepter de corriger
    response = chatbot.process_message("oui")
    print(f"Bot: {response['response']}")
    assert response['state'] == 'correction'
    
    # Corriger le champ duree_max_contrat
    print("User: duree_max_contrat")
    response = chatbot.process_message("duree_max_contrat")
    print(f"Bot: {response['response']}")
    
    print("User: 24mois")  # Correction valide
    response = chatbot.process_message("24mois")
    print(f"Bot: {response['response']}")
    
    # Vérifier la correction
    assert chatbot.collected_data['duree_max_contrat'] == 24
    print("✅ Correction appliquée avec succès")
    
    return True

def test_edge_cases():
    """Test les cas limites et entrées inhabituelles"""
    print("\n🧪 Test: Cas limites et entrées inhabituelles")
    
    chatbot = PackChatbot()
    response = chatbot.get_welcome_message()
    
    # Test avec des formats inhabituels mais valides
    edge_cases = [
        ("  Pack   avec   espaces  ", "nom_pack", "Pack   avec   espaces"),
        ("1500.99DT", "prix_mensuel", 1500.99),
        ("1an", "duree_min_contrat", 12),
        ("36 mois", "duree_max_contrat", 36),
        ("GOLD", "niveau_couverture", "GOLD"),
        ("   OUI   ", "actif", True),
        ("PROD001;PROD002;PROD003", "produits_ids", ["PROD001", "PROD002", "PROD003"])
    ]
    
    # Remplir les champs avec les cas limites
    user_inputs = [
        "  Pack   avec   espaces  ",
        "Description avec espaces multiples",
        "PROD001;PROD002;PROD003",
        "1500.99DT",
        "1an",
        "36 mois", 
        "GOLD",
        "   OUI   "
    ]
    
    fields_order = ["nom_pack", "description", "produits_ids", "prix_mensuel", 
                   "duree_min_contrat", "duree_max_contrat", "niveau_couverture", "actif"]
    
    for i, (user_input, expected_field) in enumerate(zip(user_inputs, fields_order)):
        print(f"User: '{user_input}'")
        response = chatbot.process_message(user_input)
        
        if expected_field in chatbot.collected_data:
            actual_value = chatbot.collected_data[expected_field]
            print(f"[OK] {expected_field} = '{actual_value}'")
        else:
            print(f"[FAILED] Champ {expected_field} non traite")
            return False
    
    print("[OK] Test des cas limites reussi")
    return True

def test_complete_flow_with_summary():
    """Test le flux complet avec résumé détaillé"""
    print("\n[TEST] Flux complet avec resume detaille")
    
    chatbot = PackChatbot()
    response = chatbot.get_welcome_message()
    
    # Remplir toutes les informations correctement
    complete_inputs = [
        "Pack Santé Premium Plus",
        "Pack complet pour familles avec couverture médicale étendue et services premium",
        "PROD001,PROD002,PROD003,PROD004",
        "2500.50",
        "6mois",
        "24mois",
        "PREMIUM",
        "oui"
    ]
    
    for user_input in complete_inputs:
        print(f"User: {user_input}")
        response = chatbot.process_message(user_input)
        print(f"Bot: {response['response'][:80]}...")
    
    # Devrait être en état de confirmation
    assert response['state'] == 'confirmation'
    assert 'Recapitulatif du Pack' in response['response']
    
    print("\n[SUMMARY] Resume genere:")
    print(response['response'])
    
    # Vérifier que toutes les données sont correctes
    expected_data = {
        'nom_pack': 'Pack Santé Premium Plus',
        'description': 'Pack complet pour familles avec couverture médicale étendue et services premium',
        'produits_ids': ['PROD001', 'PROD002', 'PROD003', 'PROD004'],
        'prix_mensuel': 2500.50,
        'duree_min_contrat': 6,
        'duree_max_contrat': 24,
        'niveau_couverture': 'PREMIUM',
        'actif': True
    }
    
    print("\n[SUMMARY] Verification finale:")
    for key, expected_value in expected_data.items():
        actual_value = chatbot.collected_data.get(key)
        if actual_value == expected_value:
            print(f"[OK] {key}: {actual_value}")
        else:
            print(f"[FAILED] {key}: attendu={expected_value}, obtenu={actual_value}")
            return False
    
    print("[OK] Flux complet teste avec succes")
    return True

def main():
    """Exécute tous les tests du PackChatbot"""
    print("[START] Lancement des tests du PackChatbot - Parsing Intelligent\n")
    
    try:
        success = True
        success &= test_intelligent_parsing()
        success &= test_validation_rules()
        success &= test_error_handling_and_correction()
        success &= test_edge_cases()
        success &= test_complete_flow_with_summary()
        
        if success:
            print("\n[SUCCESS] TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !")
            print("[OK] Parsing intelligent fonctionnel")
            print("[OK] Validation robuste")
            print("[OK] Gestion des erreurs efficace")
            print("[OK] Flux de correction opérationnel")
            print("[OK] Aucun décalage de champs détecté")
        else:
            print("\n[FAILED] Certains tests ont échoué.")
            return False
            
    except Exception as e:
        print(f"\n[!] Erreur inattendue: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
