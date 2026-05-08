""" Scoring Engine - Moteur de scoring ML
Utilise un modèle Random Forest pour prédire le score de pertinence
de chaque pack d'assurance par rapport au profil client.
Le modèle est entraîné sur des données simulées et peut être
ré-entraîné avec des données historiques réelles. """
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import requests
from builtins import print

class ScoringEngine:
    """ Moteur de scoring basé sur du Machine Learning (Random Forest).
    Prédit la pertinence d'un pack d'assurance pour un profil client donné. """

    MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")
    ENCODERS_PATH = os.path.join(os.path.dirname(__file__), "encoders.joblib")

    def __init__(self):
        self.model = None
        self.encoders = {}
        self.product_service_url = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:9093")

        # Charger le modèle existant si disponible
        if os.path.exists(self.MODEL_PATH) and os.path.exists(self.ENCODERS_PATH):
            try:
                self.model = joblib.load(self.MODEL_PATH)
                self.encoders = joblib.load(self.ENCODERS_PATH)
                print("[ScoringEngine] Modèle chargé avec succès.")
            except (EOFError, Exception) as e:
                print(f"[ScoringEngine] Fichier modèle corrompu, suppression : {e}")
                self.model = None
                self.encoders = {}
                # Supprimer les fichiers corrompus
                if os.path.exists(self.MODEL_PATH):
                    os.remove(self.MODEL_PATH)
                if os.path.exists(self.ENCODERS_PATH):
                    os.remove(self.ENCODERS_PATH)

    def train_model(self) -> dict:
        """ Entraîner le modèle ML sur des données simulées.
        En production, ces données viendraient de l'historique des souscriptions. """
        # Générer des données simulées
        data = self._generate_training_data()
        df = pd.DataFrame(data)

        # Encoder les variables catégorielles
        self.encoders = {}
        categorical_cols = ["sexe", "profession", "situation_familiale", "niveau_couverture"]

        for col in categorical_cols:
            le = LabelEncoder()
            # On s'assure qu'une catégorie "Autre" existe pour la robustesse
            unique_values = df[col].unique().tolist()
            if "Autre" not in unique_values and col in ["profession", "situation_familiale"]:
                unique_values.append("Autre")
            
            le.fit(unique_values)
            df[col + "_encoded"] = le.transform(df[col].astype(str))
            self.encoders[col] = le

        # Features
        feature_cols = [
            "age", "sexe_encoded", "profession_encoded", "situation_familiale_encoded",
            "maladie_chronique", "diabetique", "tension", "maladies_legeres",
            "nombre_beneficiaires", "budget_mensuel", "pack_prix", "niveau_couverture_encoded",
            "has_garantie_chronique", "has_garantie_legere",
            "has_garantie_ophtalmo", "has_garantie_dentaire",
            "has_garantie_hospitalisation", "has_garantie_maternite"  ]

        X = df[feature_cols].values
        y = df["score_category"].values  # 0=mauvais, 1=moyen, 2=bon

        # Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Entraîner le Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X_train, y_train)

        # Évaluer
        y_test_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_test_pred)

        # Sauvegarder
        joblib.dump(self.model, self.MODEL_PATH)
        joblib.dump(self.encoders, self.ENCODERS_PATH)

        return {
            "status": "success",
            "message": f"Modèle entraîné avec succès",
            "accuracy": round(accuracy * 100, 2),
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "features": feature_cols
        }

    def get_model_status(self) -> dict:
        """Retourne les informations sur l'état du modèle."""
        if self.model is None:
            return {"status": "NOT_TRAINED", "message": "Le modèle n'a pas encore été initialisé."}
        
        return {
            "status": "READY",
            "model_type": "RandomForestClassifier",
            "n_estimators": self.model.n_estimators,
            "features": [
                "age", "sexe", "profession", "situation_familiale", 
                "maladie_chronique", "diabetique", "tension", "maladies_legeres",
                "nb_beneficiaires", "budget", "prix_pack", "niveau_couverture"
            ],
            "categories_supported": {col: list(le.classes_) for col, le in self.encoders.items()}
        }

    def score_packs(self, client_profile: dict) -> dict:
        """  Scorer tous les packs disponibles pour un profil client donné.
        Args:
            client_profile: dict avec age, sexe, profession, etc.
        Returns:
            dict avec scored_packs trié par score décroissant   """
        # Si pas de modèle, entraîner d'abord
        if self.model is None:
            self.train_model()

        # Récupérer les packs depuis le Product Service
        try:
            packs = requests.get(f"{self.product_service_url}/api/packs", timeout=5).json()
            produits = requests.get(f"{self.product_service_url}/api/produits", timeout=5).json()
            garanties = requests.get(f"{self.product_service_url}/api/garanties", timeout=5).json()
        except requests.exceptions.ConnectionError:
            return {
                "status": "error",
                "message": "Service produit non disponible",
                "scored_packs": []
            }

        # Maps
        garanties_map = {g["idGarantie"]: g for g in garanties}

        scored_packs = []
        for pack in packs:
            if not pack.get("actif", False):
                continue

            # Déterminer les garanties du pack directement depuis ses champs
            pack_garantie_types = set()
            all_garantie_ids = list(pack.get("garantiesInclusesIds") or []) + \
                               list(pack.get("garantiesOptionnellesIds") or [])
            for gid in all_garantie_ids:
                g = garanties_map.get(gid)
                if g:
                    pack_garantie_types.add(g.get("typeGarantie", ""))

            # Construire le feature vector
            features = self._build_features(client_profile, pack, pack_garantie_types)

            # Prédire avec le modèle
            prediction = self.model.predict([features])[0]
            probabilities = self.model.predict_proba([features])[0]

            # Convertir en score 0-100
            score = round(probabilities[2] * 100 if len(probabilities) > 2 else probabilities[-1] * 100, 1)

            # Générer les raisons
            raisons = self._generate_reasons(client_profile, pack_garantie_types, score, pack.get("prixMensuel", 0))

            scored_packs.append({
                "packId": pack.get("idPack"),
                "nomPack": pack.get("nomPack"),
                "score": score,
                "category": ["Non recommandé", "Acceptable", "Recommandé"][int(prediction)],
                "raisons": raisons,
                "prixMensuel": pack.get("prixMensuel", 0),
                "niveauCouverture": pack.get("niveauCouverture", "")
            })

        # Trier par score décroissant
        scored_packs.sort(key=lambda x: x["score"], reverse=True)

        return {
            "status": "success",
            "client_profile": client_profile,
            "scored_packs": scored_packs,
            "total_packs_evaluated": len(scored_packs)
        }

    def _build_features(self, profile: dict, pack: dict, garantie_types: set) -> list:
        """Construire le vecteur de features pour la prédiction."""
        # Encoder le sexe
        sexe_encoded = self._safe_encode("sexe", profile.get("sexe", "M"))
        profession_encoded = self._safe_encode("profession", profile.get("profession", "Autre"))
        situation_encoded = self._safe_encode("situation_familiale",
                                              profile.get("situation_familiale", "Célibataire"))
        niveau_encoded = self._safe_encode("niveau_couverture",
                                           pack.get("niveauCouverture", "basic"))

        return [
            profile.get("age", 30),
            sexe_encoded,
            profession_encoded,
            situation_encoded,
            int(profile.get("maladie_chronique", False)),
            int(profile.get("diabetique", False)),
            int(profile.get("tension", False)),
            int(profile.get("maladies_legeres", False)),
            profile.get("nombre_beneficiaires", 1),
            profile.get("budget_mensuel", 0),
            pack.get("prixMensuel", 0),
            niveau_encoded,
            int("MALADIE_CHRONIQUE" in garantie_types),
            int("MALADIE_LEGERE" in garantie_types),
            int("OPHTALMOLOGIE" in garantie_types),
            int("DENTAIRE" in garantie_types),
            int("HOSPITALISATION" in garantie_types),
            int("MATERNITE" in garantie_types)
        ]

    def _safe_encode(self, col_name: str, value) -> int:
        """Encoder une valeur de manière safe (mapping vers 'Autre' si inconnu)."""
        if col_name in self.encoders:
            le = self.encoders[col_name]
            val_str = str(value)
            if val_str in le.classes_:
                return le.transform([val_str])[0]
            
            # Si inconnu, essayer 'Autre' ou la première classe par défaut
            if "Autre" in le.classes_:
                return le.transform(["Autre"])[0]
            if "Autre" in val_str: # Parfois l'input contient déjà Autre
                return le.transform([le.classes_[0]])[0]
                
            return le.transform([le.classes_[0]])[0]
        return 0

    def _generate_reasons(self, profile: dict, garantie_types: set, score: float, pack_prix: float = 0) -> list:
        """Générer des raisons explicatives plus précises."""
        raisons = []

        # Analyse des besoins critiques (Maladies chroniques)
        if profile.get("maladie_chronique"):
            if "MALADIE_CHRONIQUE" in garantie_types:
                raisons.append("✅ Couvre spécifiquement vos besoins pathologiques")
            else:
                raisons.append("❌ Attention: Ne couvre pas les maladies chroniques")

        # Analyse du budget
        budget = profile.get("budget_mensuel", 0)
        if budget > 0:
            if pack_prix <= budget:
                raisons.append("💰 Pile dans votre budget mensuel")
            elif pack_prix <= budget * 1.2:
                raisons.append("⚖️ Légèrement au-dessus du budget mais équilibré")

        # Garanties premium
        confort_count = sum(1 for g in ["OPHTALMOLOGIE", "DENTAIRE", "MATERNITE"] if g in garantie_types)
        if confort_count >= 2:
            raisons.append("💎 Excellent niveau de confort (Optique/Dentaire/Maternité)")

        # Synthèse globale
        if score >= 80:
            raisons.insert(0, "⭐ Recommandation prioritaire pour votre profil")
        elif score >= 50:
            raisons.insert(0, "👍 Option solide et adaptée")
        else:
            raisons.insert(0, "ℹ️ Option de base avec une couverture limitée")

        return raisons

    def _generate_training_data(self) -> list:
        """
        Génère des données d'entraînement simulées.
        Simule 1000 interactions client/pack avec des scores réalistes.
        """
        np.random.seed(42)
        data = []

        sexes = ["M", "F"]
        professions = ["Ingénieur", "Médecin", "Enseignant", "Commerçant", "Étudiant",
                        "Ouvrier", "Cadre", "Retraité", "Agriculteur", "Autre"]
        situations = ["Célibataire", "Marié", "Divorcé", "Veuf"]
        niveaux = ["basic", "premium", "gold"]

        for _ in range(1000):
            age = np.random.randint(18, 70)
            sexe = np.random.choice(sexes)
            profession = np.random.choice(professions)
            situation = np.random.choice(situations)
            maladie_chronique = np.random.choice([0, 1], p=[0.7, 0.3])
            diabetique = np.random.choice([0, 1], p=[0.8, 0.2]) if maladie_chronique else 0
            tension_val = np.random.choice([0, 1], p=[0.75, 0.25]) if maladie_chronique else 0
            maladies_legeres = np.random.choice([0, 1], p=[0.4, 0.6])
            nombre_benef = np.random.randint(1, 6)
            budget = np.random.choice([50, 100, 150, 200, 300, 500])

            # Simuler un pack
            niveau = np.random.choice(niveaux)
            pack_prix = {"basic": np.random.uniform(30, 100),
                          "premium": np.random.uniform(100, 250),
                          "gold": np.random.uniform(250, 500)}[niveau]

            has_chronique = np.random.choice([0, 1], p=[0.4, 0.6])
            has_legere = np.random.choice([0, 1], p=[0.3, 0.7])
            has_ophtalmo = np.random.choice([0, 1], p=[0.5, 0.5])
            has_dentaire = np.random.choice([0, 1], p=[0.5, 0.5])
            has_hospi = np.random.choice([0, 1], p=[0.4, 0.6])
            has_maternite = np.random.choice([0, 1], p=[0.6, 0.4])

            # Calculer un score réaliste
            score = 0
            if maladie_chronique and has_chronique:
                score += 30
            if maladie_chronique and not has_chronique:
                score -= 20
            if diabetique and has_chronique:
                score += 15
            if tension_val and has_chronique:
                score += 10
            if maladies_legeres and has_legere:
                score += 15
            if has_ophtalmo:
                score += 5
            if has_hospi:
                score += 10
            if has_dentaire:
                score += 5
            if situation in ["Marié"] and has_maternite:
                score += 10
            if pack_prix <= budget:
                score += 10
            elif pack_prix > budget * 1.5:
                score -= 15
            if niveau == "gold":
                score += 5
            if age > 50 and has_hospi:
                score += 10

            # Normaliser et catégoriser
            score = max(0, min(100, score))
            if score >= 60:
                category = 2  # bon
            elif score >= 30:
                category = 1  # moyen
            else:
                category = 0  # mauvais

            data.append({
                "age": age,
                "sexe": sexe,
                "profession": profession,
                "situation_familiale": situation,
                "maladie_chronique": maladie_chronique,
                "diabetique": diabetique,
                "tension": tension_val,
                "maladies_legeres": maladies_legeres,
                "nombre_beneficiaires": nombre_benef,
                "budget_mensuel": budget,
                "pack_prix": round(pack_prix, 2),
                "niveau_couverture": niveau,
                "has_garantie_chronique": has_chronique,
                "has_garantie_legere": has_legere,
                "has_garantie_ophtalmo": has_ophtalmo,
                "has_garantie_dentaire": has_dentaire,
                "has_garantie_hospitalisation": has_hospi,
                "has_garantie_maternite": has_maternite,
                "score_category": category
            })

        return data
