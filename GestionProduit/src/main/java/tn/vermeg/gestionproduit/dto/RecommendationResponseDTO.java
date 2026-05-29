package tn.vermeg.gestionproduit.dto;

import java.util.List;
import java.util.Map;

/**
 * Réponse complète du moteur de recommandation IA
 * Contient les produits, packs et garanties recommandés avec les scores
 */
public class RecommendationResponseDTO {
    
    private boolean success;
    private String message;
    
    // Client associé
    private String idClient;
    private String nomClient;
    
    // Recommandations segmentées
    private List<RecommendedItemDTO> produitsRecommandes;
    private List<RecommendedItemDTO> packsRecommandes;
    private List<RecommendedItemDTO> garantiesRecommandees;
    
    // Tous les recommandations fusionnées et triées par score
    private List<RecommendedItemDTO> toutesRecommendations;
    
    // Résumé et explications
    private String resumeRecommandation; // Synthèse IA de la recommandation
    private String explicitationChoix; // Explication détaillée des choix
    
    // Prompt généré (pour transparence)
    private String promptGenere;
    
    // Détails de la demande
    private ClientProfileDTO profilClient;
    private Map<String, Object> criteresFiltrage;
    
    // Métadonnées
    private Long timestampGeneration;
    private String modeleIA; // Ex: "Google Gemini", "OpenAI GPT-4"
    private Double tempsTraitementMs;
    
    // Erreurs et avertissements
    private List<String> avertissements;
    private List<String> erreurs;
    
    // Constructeurs
    public RecommendationResponseDTO() {
        this.success = true;
        this.timestampGeneration = System.currentTimeMillis();
    }
    
    public RecommendationResponseDTO(String idClient, String nomClient) {
        this.idClient = idClient;
        this.nomClient = nomClient;
    }
    
    // Getters & Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getIdClient() { return idClient; }
    public void setIdClient(String idClient) { this.idClient = idClient; }
    
    public String getNomClient() { return nomClient; }
    public void setNomClient(String nomClient) { this.nomClient = nomClient; }
    
    public List<RecommendedItemDTO> getProduitsRecommandes() { return produitsRecommandes; }
    public void setProduitsRecommandes(List<RecommendedItemDTO> produitsRecommandes) { this.produitsRecommandes = produitsRecommandes; }
    
    public List<RecommendedItemDTO> getPacksRecommandes() { return packsRecommandes; }
    public void setPacksRecommandes(List<RecommendedItemDTO> packsRecommandes) { this.packsRecommandes = packsRecommandes; }
    
    public List<RecommendedItemDTO> getGarantiesRecommandees() { return garantiesRecommandees; }
    public void setGarantiesRecommandees(List<RecommendedItemDTO> garantiesRecommandees) { this.garantiesRecommandees = garantiesRecommandees; }
    
    public List<RecommendedItemDTO> getToutesRecommendations() { return toutesRecommendations; }
    public void setToutesRecommendations(List<RecommendedItemDTO> toutesRecommendations) { this.toutesRecommendations = toutesRecommendations; }
    
    public String getResumeRecommandation() { return resumeRecommandation; }
    public void setResumeRecommandation(String resumeRecommandation) { this.resumeRecommandation = resumeRecommandation; }
    
    public String getExplicitationChoix() { return explicitationChoix; }
    public void setExplicitationChoix(String explicitationChoix) { this.explicitationChoix = explicitationChoix; }
    
    public String getPromptGenere() { return promptGenere; }
    public void setPromptGenere(String promptGenere) { this.promptGenere = promptGenere; }
    
    public ClientProfileDTO getProfilClient() { return profilClient; }
    public void setProfilClient(ClientProfileDTO profilClient) { this.profilClient = profilClient; }
    
    public Map<String, Object> getCriteresFiltrage() { return criteresFiltrage; }
    public void setCriteresFiltrage(Map<String, Object> criteresFiltrage) { this.criteresFiltrage = criteresFiltrage; }
    
    public Long getTimestampGeneration() { return timestampGeneration; }
    public void setTimestampGeneration(Long timestampGeneration) { this.timestampGeneration = timestampGeneration; }
    
    public String getModeleIA() { return modeleIA; }
    public void setModeleIA(String modeleIA) { this.modeleIA = modeleIA; }
    
    public Double getTempsTraitementMs() { return tempsTraitementMs; }
    public void setTempsTraitementMs(Double tempsTraitementMs) { this.tempsTraitementMs = tempsTraitementMs; }
    
    public List<String> getAvertissements() { return avertissements; }
    public void setAvertissements(List<String> avertissements) { this.avertissements = avertissements; }
    
    public List<String> getErreurs() { return erreurs; }
    public void setErreurs(List<String> erreurs) { this.erreurs = erreurs; }
    
    // Méthodes utilitaires
    public void addAvertissement(String avertissement) {
        if (this.avertissements == null) {
            this.avertissements = new java.util.ArrayList<>();
        }
        this.avertissements.add(avertissement);
    }
    
    public void addErreur(String erreur) {
        if (this.erreurs == null) {
            this.erreurs = new java.util.ArrayList<>();
        }
        this.erreurs.add(erreur);
        this.success = false;
    }
}


