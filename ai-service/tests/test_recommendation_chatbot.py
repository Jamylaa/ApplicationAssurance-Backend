""" Tests pour le chatbot de recommandation séparé.
Valide le fonctionnement du RecommendationChatbot de manière isolée.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chatbot.RecommendationChatbot import RecommendationChatbot

def test_welcome_message():
    """Test le message de bienvenue."""
    print("Test: Message de bienvenue")
    chatbot = RecommendationChatbot()
    result = chatbot.get_welcome_message()
    
    assert "assistant d'assurance santé" in result["response"]
    assert result["next_field"] == "age"
    assert result["is_complete"] == False
    assert result["progress"] == 0
    print("Message de bienvenue valide")

def test_age_extraction():
    """Test l'extraction de l'âge."""
    print("\nTest: Extraction de l'âge")
    chatbot = RecommendationChatbot()
    
    # Test avec nombre
    result = chatbot._extract_int("j'ai 35 ans")
    assert result == 35
    print("Extraction numerique: 35")
    
    # Test avec mot
    result = chatbot._extract_int("j'ai quarante ans")
    assert result == 40
    print("Extraction mot: quarante -> 40")
    
    # Test invalide
    result = chatbot._extract_int("je ne sais pas")
    assert result is None
    print("Extraction invalide: None")

def test_sex_extraction():
    """Test l'extraction du sexe."""
    print("\nTest: Extraction du sexe")
    chatbot = RecommendationChatbot()
    choices = ["Homme", "Femme", "M", "F"]
    
    # Test avec variations
    test_cases = [
        ("homme", "M"),
        ("femme", "F"),
        ("je suis masculin", "M"),
        ("féminin", "F"),
        ("H", "M"),
        ("F", "F")
    ]
    
    for message, expected in test_cases:
        result = chatbot._extract_choice(message, choices)
        assert result == expected, f"Échec pour '{message}': attendu {expected}, obtenu {result}"
        print(f"Extraction '{message}' -> {expected}")

def test_boolean_extraction():
    """Test l'extraction de booléens."""
    print("\nTest: Extraction de booleens")
    chatbot = RecommendationChatbot()
    
    positive_cases = ["oui", "Oui", "O", "yes", "vrai", "absolument", "bien sûr"]
    negative_cases = ["non", "Non", "N", "no", "faux", "pas du tout", "jamais"]
    
    for case in positive_cases:
        result = chatbot._extract_boolean(case)
        assert result == True, f"Échec positif pour '{case}'"
        print(f"Positif '{case}' -> True")
    
    for case in negative_cases:
        result = chatbot._extract_boolean(case)
        assert result == False, f"Échec négatif pour '{case}'"
        print(f"Negatif '{case}' -> False")

def test_complete_conversation():
    """Test une conversation complète."""
    print("\nTest: Conversation complete")
    chatbot = RecommendationChatbot()
    
    # Simuler une conversation complète
    history = []
    
    # Message de bienvenue
    welcome = chatbot.get_welcome_message()
    history.append({"role": "bot", "content": welcome["response"]})
    
    # Réponses utilisateur
    user_responses = [
        "30",                                    # age
        "homme",                                 # sexe
        "ingénieur",                             # profession
        "marié",                                 # situation familiale
        "non",                                   # maladie chronique
        "oui",                                   # maladies légères
        "2",                                     # nombre bénéficiaires
        "24",                                    # durée contrat
        "150"                                    # budget mensuel
    ]
    
    for i, response in enumerate(user_responses):
        history.append({"role": "user", "content": response})
        
        result = chatbot.process_message(response, history)
        history.append({"role": "bot", "content": result["response"]})
        
        if not result["is_complete"]:
            print(f"Étape {i+1}: {result['next_field']} -> {response}")
        else:
            print(f"Conversation terminee")
            print(f"Réponse: {result['response'][:100]}...")
            break
    
    # Vérifier que toutes les données ont été collectées
    expected_keys = ['age', 'sexe', 'profession', 'situation_familiale', 
                    'maladie_chronique', 'maladies_legeres', 'nombre_beneficiaires',
                    'duree_contrat_souhaitee', 'budget_mensuel']
    
    for key in expected_keys:
        assert key in result["collected_data"], f"Clé manquante: {key}"
    
    print("Toutes les donnees collectees")

def test_conditional_fields():
    """Test les champs conditionnels (diabète, tension)."""
    print("\nTest: Champs conditionnels")
    chatbot = RecommendationChatbot()
    
    # Cas 1: Pas de maladie chronique -> pas de questions sur diabète/tension
    history = [
        {"role": "user", "content": "25"},
        {"role": "user", "content": "femme"},
        {"role": "user", "content": "enseignante"},
        {"role": "user", "content": "célibataire"},
        {"role": "user", "content": "non"}  # maladie chronique = non
    ]
    
    collected = chatbot._extract_collected_data(history)
    assert "diabetique" not in collected, "Diabète ne devrait pas être demandé"
    assert "tension" not in collected, "Tension ne devrait pas être demandée"
    print("Champs conditionnels non demandes si maladie chronique = non")
    
    # Cas 2: Maladie chronique = oui -> questions sur diabète/tension
    history = [
        {"role": "user", "content": "45"},
        {"role": "user", "content": "homme"},
        {"role": "user", "content": "comptable"},
        {"role": "user", "content": "marié"},
        {"role": "user", "content": "oui"},  # maladie chronique = oui
        {"role": "user", "content": "non"},  # diabète
        {"role": "user", "content": "oui"}   # tension
    ]
    
    collected = chatbot._extract_collected_data(history)
    assert "diabetique" in collected, "Diabète devrait être demandé"
    assert "tension" in collected, "Tension devrait être demandée"
    print("Champs conditionnels demandes si maladie chronique = oui")

def test_progress_calculation():
    """Test le calcul de progression."""
    print("\nTest: Calcul de progression")
    chatbot = RecommendationChatbot()
    
    # Progression initiale
    progress = chatbot._calculate_progress({})
    assert progress == 0
    print("Progression initiale: 0%")
    
    # Progression partielle
    partial_data = {"age": 30, "sexe": "M", "profession": "ingénieur"}
    progress = chatbot._calculate_progress(partial_data)
    assert 0 < progress < 100
    print(f"Progression partielle: {progress}%")
    
    # Progression complète
    full_data = {
        "age": 30, "sexe": "M", "profession": "ingénieur", "situation_familiale": "marié",
        "maladie_chronique": False, "maladies_legeres": True, "nombre_beneficiaires": 2,
        "duree_contrat_souhaitee": 24, "budget_mensuel": 150
    }
    progress = chatbot._calculate_progress(full_data)
    assert progress == 100
    print("Progression complete: 100%")

def test_profile_summary():
    """Test la génération du résumé de profil."""
    print("\nTest: Resume de profil")
    chatbot = RecommendationChatbot()
    
    test_data = {
        "age": 35,
        "sexe": "M",
        "profession": "architecte",
        "situation_familiale": "marié",
        "maladie_chronique": False,
        "maladies_legeres": True,
        "nombre_beneficiaires": 3,
        "duree_contrat_souhaitee": 12,
        "budget_mensuel": 200
    }
    
    summary = chatbot.get_user_profile_summary(test_data)
    assert "Votre profil d'assurance" in summary
    assert "35" in summary
    assert "architecte" in summary
    assert "Oui" in summary  # maladies légères
    assert "Non" in summary  # maladie chronique
    print("Resume de profil genere correctement")

def main():
    """Exécute tous les tests."""
    print("Lancement des tests du RecommendationChatbot\n")
    
    try:
        test_welcome_message()
        test_age_extraction()
        test_sex_extraction()
        test_boolean_extraction()
        test_complete_conversation()
        test_conditional_fields()
        test_progress_calculation()
        test_profile_summary()
        
        print("\nTous les tests sont passes avec succes !")
        print("Le chatbot de recommandation fonctionne correctement")
        
    except AssertionError as e:
        print(f"\nTest echoue: {e}")
        return False
    except Exception as e:
        print(f"\nErreur inattendue: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
