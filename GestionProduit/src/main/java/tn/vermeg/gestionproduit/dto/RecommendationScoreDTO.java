package tn.vermeg.gestionproduit.dto;

import java.util.Map;

/**
 * Score de recommandation détaillé avec tous les critères d'évaluation
 */
public class RecommendationScoreDTO {
    
    // Scores partiels (0 à 100 chacun)
    private Double scoreAdaptationBudget; // Matching budget client
    private Double scoreAdaptationAge; // Matching groupe d'âge
    private Double scoreAdaptationGaranties; // Matching garanties demandées
    private Double scoreSante; // Matching état de santé
    private Double scoreNiveauCouverture; // Matching niveau couverture
    private Double scoreFamilial; // Matching situation familiale
    private Double scoreProfessionnel; // Matching profession
    private Double scoreGeographique; // Matching couverture géographique
    
    // Score global
    private Double scoreGlobal; // Moyenne pondérée
    
    // Détails de calcul
    private Map<String, Double> poidsFacteurs;
    private String explicationScore;
    
    // Constructeurs
    public RecommendationScoreDTO() {
        this.scoreGlobal = 0.0;
    }
    
    public RecommendationScoreDTO(Double scoreGlobal) {
        this.scoreGlobal = scoreGlobal;
    }
    
    // Getters & Setters
    public Double getScoreAdaptationBudget() { return scoreAdaptationBudget; }
    public void setScoreAdaptationBudget(Double scoreAdaptationBudget) { this.scoreAdaptationBudget = scoreAdaptationBudget; }
    
    public Double getScoreAdaptationAge() { return scoreAdaptationAge; }
    public void setScoreAdaptationAge(Double scoreAdaptationAge) { this.scoreAdaptationAge = scoreAdaptationAge; }
    
    public Double getScoreAdaptationGaranties() { return scoreAdaptationGaranties; }
    public void setScoreAdaptationGaranties(Double scoreAdaptationGaranties) { this.scoreAdaptationGaranties = scoreAdaptationGaranties; }
    
    public Double getScoreSante() { return scoreSante; }
    public void setScoreSante(Double scoreSante) { this.scoreSante = scoreSante; }
    
    public Double getScoreNiveauCouverture() { return scoreNiveauCouverture; }
    public void setScoreNiveauCouverture(Double scoreNiveauCouverture) { this.scoreNiveauCouverture = scoreNiveauCouverture; }
    
    public Double getScoreFamilial() { return scoreFamilial; }
    public void setScoreFamilial(Double scoreFamilial) { this.scoreFamilial = scoreFamilial; }
    
    public Double getScoreProfessionnel() { return scoreProfessionnel; }
    public void setScoreProfessionnel(Double scoreProfessionnel) { this.scoreProfessionnel = scoreProfessionnel; }
    
    public Double getScoreGeographique() { return scoreGeographique; }
    public void setScoreGeographique(Double scoreGeographique) { this.scoreGeographique = scoreGeographique; }
    
    public Double getScoreGlobal() { return scoreGlobal; }
    public void setScoreGlobal(Double scoreGlobal) { this.scoreGlobal = scoreGlobal; }
    
    public Map<String, Double> getPoidsFacteurs() { return poidsFacteurs; }
    public void setPoidsFacteurs(Map<String, Double> poidsFacteurs) { this.poidsFacteurs = poidsFacteurs; }
    
    public String getExplicationScore() { return explicationScore; }
    public void setExplicationScore(String explicationScore) { this.explicationScore = explicationScore; }
}

