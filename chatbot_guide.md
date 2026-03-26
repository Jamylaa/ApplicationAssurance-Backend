# 🤖 Guide d'utilisation du Chatbot IA (Vermeg)

Bienvenue dans la démonstration du chatbot intelligent. Ce système utilise le **Traitement du Langage Naturel (NLP)** pour comprendre vos réponses et vous guider.

---

## 🛡️ Mode Client : Recommandation de Packs
Le chatbot client vous aide à trouver l'assurance idéale en analysant votre profil de santé.

### Comment démarrer ?
1. Accédez à la section **Chatbot** de votre espace client.
2. Le chatbot vous saluera et posera la première question.

### Exemples d'interactions "Parfaites" :
Le chatbot est flexible. Vous pouvez répondre par des phrases complètes ou des mots-clés.

| Question | Exemple de réponse fluide | Extraction NLP |
| :--- | :--- | :--- |
| **Âge** | "J'ai **35** ans" | `35` |
| **Sexe** | "Je suis un **homme**" | `M` |
| **Profession** | "Je travaille comme **Ingénieur**" | `Ingénieur` |
| **Maladie Chronique** | "**Non**, je suis en bonne santé" | `False` |
| **Bénéficiaires** | "On sera **3** personnes" | `3` |
| **Budget** | "Environ **150** dinars par mois" | `150.0` |

### ✅ Résultat final
Une fois toutes les données collectées, le chatbot affiche une liste de packs classés par **score de pertinence** (ex: 95/100).

---

## ⚙️ Mode Admin : Création de Packs via l'IA
En tant qu'administrateur, vous pouvez créer un pack complexe simplement en discutant avec l'assistant.

### Comment démarrer ?
Accédez à l'onglet **Assistant IA** dans votre tableau de bord Admin.

### Flux de création (Exemple) :
1. **Nom du pack** : *"Pack Jeunes Sportifs"*
2. **Description** : *"Un pack adapté aux activités physiques intenses."*
3. **Niveau** : *"Premium"* (Le bot reconnaît : basic, premium, gold)
4. **Garanties** : *"Je veux hospitalisation, dentaire et ophtalmologie"* (Le bot extrait les 3 automatiquement)
5. **Prix** : *"85 dinars"*
6. **Éligibilité** : Donnez les limites d'âge (ex: 18 à 45 ans).

### 🚀 Validation
À la fin, le chatbot crée automatiquement :
*   Les **Garanties** manquantes dans la base de données.
*   Le **Produit** associé avec les critères de santé.
*   Le **Pack** prêt à être commercialisé.

---

## 💡 Conseils pour une utilisation parfaite
*   **Soyez naturel** : Pas besoin de commandes rigides. "Oui", "Ouais", "Bien sûr" sont tous compris par l'IA.
*   **Multi-sélection** : Pour les garanties, listez-les simplement dans une phrase : *"Mettez hospitalisation et maternité"*.
*   **Correction** : Si vous vous trompez, continuez le flux, les données sont collectées à la volée.

---

## 🧠 Le "Cerveau" de l'IA : Machine Learning (Random Forest)
Contrairement à un bot classique, ce chatbot utilise un modèle **Machine Learning** pour ses recommandations.

*   **Apprentissage** : Si le système manque de données, il s'auto-entraîne sur des simulations pour rester pertinent.
*   **Précision** : Plus vous donnez de détails (maladies, budget, profession), plus le score de confiance augmente.
*   **Transparence** : Pour chaque recommandation, le bot explique **pourquoi** (ex: "Idéal car couvre l'hospitalisation").

---

## 🛠️ Vérification technique (Avant démo)
Pour que la démo fonctionne parfaitement, vérifiez que ces services sont lancés :
1.  **AI Service** (Flask) : Port `5000`
2.  **Product Service** (Spring) : Port `9093`
3.  **Recommendation Service** (Spring) : Port `9095`

> [!TIP]
> Vous pouvez forcer l'entraînement du modèle via une requête POST à `/api/train` pour garantir des résultats optimaux lors de votre présentation.
