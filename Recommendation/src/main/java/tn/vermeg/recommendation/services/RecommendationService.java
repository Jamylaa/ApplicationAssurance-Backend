package tn.vermeg.recommendation.services;
import org.springframework.stereotype.Service;
import tn.vermeg.recommendation.dto.GarantieDTO;
import tn.vermeg.recommendation.dto.PackDTO;
import tn.vermeg.recommendation.dto.ProduitDTO;
import tn.vermeg.recommendation.entities.QuestionnaireResponse;
import tn.vermeg.recommendation.entities.RecommendationResult;
import tn.vermeg.recommendation.entities.ScoredPack;
import tn.vermeg.recommendation.feign.ProduitServiceClient;
import tn.vermeg.recommendation.repositories.QuestionnaireResponseRepository;
import tn.vermeg.recommendation.repositories.RecommendationResultRepository;

import java.util.*;
import java.util.stream.Collectors;
 //Analyse les réponses du questionnaire et calcule un score de pertinence pour chaque pack d'assurance disponible.

@Service
public class RecommendationService {

    private final ProduitServiceClient produitServiceClient;
    private final QuestionnaireResponseRepository questionnaireRepo;
    private final RecommendationResultRepository recommendationRepo;

    public RecommendationService(ProduitServiceClient produitServiceClient,
                                  QuestionnaireResponseRepository questionnaireRepo,
                                  RecommendationResultRepository recommendationRepo) {
        this.produitServiceClient = produitServiceClient;
        this.questionnaireRepo = questionnaireRepo;
        this.recommendationRepo = recommendationRepo;
    }

    /**
     * Évalue les packs d'assurance pour un questionnaire donné.
     * 1) Sauvegarde les réponses
     * 2) Récupère les packs/produits/garanties depuis GestionProduit
     * 3) Filtre par éligibilité
     * 4) Calcule un score de pertinence
     * 5) Trie et retourne les résultats
     */
    public RecommendationResult evaluate(QuestionnaireResponse questionnaire) {
        // 1. Sauvegarder le questionnaire
        questionnaire.setDateReponse(new Date());
        QuestionnaireResponse saved = questionnaireRepo.save(questionnaire);

        // 2. Récupérer les données depuis GestionProduit
        List<PackDTO> allPacks = produitServiceClient.getAllPacks();
        List<ProduitDTO> allProduits = produitServiceClient.getAllProduits();
        List<GarantieDTO> allGaranties = produitServiceClient.getAllGaranties();

        // Créer des maps pour accès rapide
        Map<String, ProduitDTO> produitsMap = allProduits.stream()
                .collect(Collectors.toMap(ProduitDTO::getIdProduit, p -> p));
        Map<String, GarantieDTO> garantiesMap = allGaranties.stream()
                .collect(Collectors.toMap(GarantieDTO::getIdGarantie, g -> g));

        // 3 & 4. Filtrer et scorer chaque pack
        List<ScoredPack> scoredPacks = new ArrayList<>();

        for (PackDTO pack : allPacks) {
            if (!pack.isActif()) continue;

            double score = 0;
            List<String> raisons = new ArrayList<>();

            // Vérifier l'éligibilité via les produits du pack
            boolean eligible = true;
            Set<String> typesGaranties = new HashSet<>();

            if (pack.getProduitsIds() != null) {
                for (String produitId : pack.getProduitsIds()) {
                    ProduitDTO produit = produitsMap.get(produitId);
                    if (produit == null || !produit.isActif()) continue;

                    // Vérification de l'âge
                    if (questionnaire.getAge() < produit.getAgeMin() ||
                        questionnaire.getAge() > produit.getAgeMax()) {
                        eligible = false;
                        raisons.add("Âge hors limites pour le produit " + produit.getNomProduit());
                        break;
                    }

                    // Vérification maladie chronique
                    if (questionnaire.isMaladieChronique() && !produit.isMaladieChroniqueAutorisee()) {
                        eligible = false;
                        raisons.add("Maladie chronique non autorisée pour " + produit.getNomProduit());
                        break;
                    }

                    // Vérification diabète
                    if (questionnaire.isDiabetique() && !produit.isDiabetiqueAutorise()) {
                        eligible = false;
                        raisons.add("Diabète non autorisé pour " + produit.getNomProduit());
                        break;
                    }

                    // Collecter les types de garanties couverts
                    if (produit.getGarantiesIds() != null) {
                        for (String gId : produit.getGarantiesIds()) {
                            GarantieDTO g = garantiesMap.get(gId);
                            if (g != null && g.isActif()) {
                                typesGaranties.add(g.getTypeGarantie());
                            }
                        }
                    }
                }
            }

            if (!eligible) continue;

            // ---- Calcul du score de pertinence (0-100) ----
            // Score basé sur la couverture des besoins santé
            if (questionnaire.isMaladieChronique() && typesGaranties.contains("MALADIE_CHRONIQUE")) {
                score += 25;
                raisons.add("+25 : Couvre les maladies chroniques");
            }
            if (questionnaire.isDiabetique() && typesGaranties.contains("MALADIE_CHRONIQUE")) {
                score += 15;
                raisons.add("+15 : Couvre le diabète via garantie chronique");
            }
            if (questionnaire.isTension() && typesGaranties.contains("MALADIE_CHRONIQUE")) {
                score += 10;
                raisons.add("+10 : Couvre la tension artérielle");
            }
            if (questionnaire.isMaladiesLegeres() && typesGaranties.contains("MALADIE_LEGERE")) {
                score += 15;
                raisons.add("+15 : Couvre les maladies légères");
            }
            // Bonus pour ophtalmologie (besoin fréquent)
            if (typesGaranties.contains("OPHTALMOLOGIE")) {
                score += 10;
                raisons.add("+10 : Inclut l'ophtalmologie");
            }

            // Bonus pour couverture dentaire
            if (typesGaranties.contains("DENTAIRE")) {
                score += 5;
                raisons.add("+5 : Inclut le dentaire");
            }

            // Bonus pour hospitalisation
            if (typesGaranties.contains("HOSPITALISATION")) {
                score += 10;
                raisons.add("+10 : Inclut l'hospitalisation");
            }

            // Bonus pour maternité si situation familiale pertinente
            if (typesGaranties.contains("MATERNITE") &&
                ("marie".equalsIgnoreCase(questionnaire.getSituationFamiliale()) ||
                 "marié".equalsIgnoreCase(questionnaire.getSituationFamiliale()) ||
                 "mariée".equalsIgnoreCase(questionnaire.getSituationFamiliale()))) {
                score += 10;
                raisons.add("+10 : Inclut maternité (pertinent pour situation familiale)");
            }

            // Score basé sur le niveau de couverture
            if ("gold".equalsIgnoreCase(pack.getNiveauCouverture())) {
                score += 5;
                raisons.add("+5 : Niveau de couverture Gold");
            } else if ("premium".equalsIgnoreCase(pack.getNiveauCouverture())) {
                score += 3;
                raisons.add("+3 : Niveau de couverture Premium");
            }

            // Score basé sur l'adéquation du prix au budget
            if (questionnaire.getBudgetMensuel() > 0 && pack.getPrixMensuel() > 0) {
                if (pack.getPrixMensuel() <= questionnaire.getBudgetMensuel()) {
                    double ratio = pack.getPrixMensuel() / questionnaire.getBudgetMensuel();
                    if (ratio >= 0.5 && ratio <= 1.0) {
                        score += 10;
                        raisons.add("+10 : Prix dans le budget");
                    } else if (ratio < 0.5) {
                        score += 5;
                        raisons.add("+5 : Prix bien en dessous du budget");
                    }
                } else {
                    score -= 10;
                    raisons.add("-10 : Prix supérieur au budget");
                }
            }

            // Score basé sur la durée de contrat souhaitée
            if (questionnaire.getDureeContratSouhaitee() > 0) {
                if (questionnaire.getDureeContratSouhaitee() >= pack.getDureeMinContrat() &&
                    questionnaire.getDureeContratSouhaitee() <= pack.getDureeMaxContrat()) {
                    score += 5;
                    raisons.add("+5 : Durée souhaitée compatible");
                }
            }

            // Normaliser le score entre 0 et 100
            score = Math.max(0, Math.min(100, score));

            // Ajouter seulement si le score est > 0
            if (score > 0) {
                scoredPacks.add(new ScoredPack(pack.getIdPack(), pack.getNomPack(), score, raisons));
            }
        }

        // 5. Trier par score décroissant
        scoredPacks.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        // Sauvegarder et retourner le résultat
        RecommendationResult result = new RecommendationResult();
        result.setQuestionnaireId(saved.getId());
        result.setClientId(questionnaire.getClientId());
        result.setScoredPacks(scoredPacks);
        result.setDateRecommendation(new Date());

        return recommendationRepo.save(result);
    }
    // Récupérer un résultat de recommandation par son ID.
    public RecommendationResult getById(String id) {
        return recommendationRepo.findById(id).orElse(null);
    }
     // Récupérer l'historique des recommandations d'un client.
    public List<RecommendationResult> getByClientId(String clientId) {
        return recommendationRepo.findByClientId(clientId);
    }
     // Récupérer tous les questionnaires d'un client.
    public List<QuestionnaireResponse> getQuestionnairesByClientId(String clientId) {
        return questionnaireRepo.findByClientId(clientId);
    }
}