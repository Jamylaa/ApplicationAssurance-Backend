package tn.vermeg.gestionproduit.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * Requête de recommandation IA
 * Contient le profil du client et les paramètres de recherche
 */
public class RecommendationRequestDTO {
    
    @NotNull(message = "Le profil client est obligatoire")
    @Valid
    private ClientProfileDTO profilClient;
    
    // Options de traitement
    private boolean inclureProduits = true;
    private boolean inclurePacks = true;
    private boolean inclureGaranties = true;
    
    // Nombre max de résultats à retourner
    private Integer maxResultats = 10;
    
    // Seuil minimum de score (0-100)
    private Double seuilMinScore = 50.0;
    
    // Détail d'explicitation (0=minimal, 1=standard, 2=détaillé)
    private Integer niveauDetail = 1;
    
    // Autres options
    private boolean explicitationCompleteChatGPT = true; // Générer une explication détaillée
    private String langue = "fr"; // Langue des recommandations
    
    // Contexte additionnel
    private String contexteAdditionnel;
    
    // Constructeurs
    public RecommendationRequestDTO() {}
    
    public RecommendationRequestDTO(ClientProfileDTO profilClient) {
        this.profilClient = profilClient;
    }
    
    // Getters & Setters
    public ClientProfileDTO getProfilClient() { return profilClient; }
    public void setProfilClient(ClientProfileDTO profilClient) { this.profilClient = profilClient; }
    
    public boolean isInclureProduits() { return inclureProduits; }
    public void setInclureProduits(boolean inclureProduits) { this.inclureProduits = inclureProduits; }
    
    public boolean isInclurePacks() { return inclurePacks; }
    public void setInclurePacks(boolean inclurePacks) { this.inclurePacks = inclurePacks; }
    
    public boolean isIncluReGaranties() { return inclureGaranties; }
    public void setIncluReGaranties(boolean inclureGaranties) { this.inclureGaranties = inclureGaranties; }
    
    public Integer getMaxResultats() { return maxResultats; }
    public void setMaxResultats(Integer maxResultats) { this.maxResultats = maxResultats; }
    
    public Double getSeuilMinScore() { return seuilMinScore; }
    public void setSeuilMinScore(Double seuilMinScore) { this.seuilMinScore = seuilMinScore; }
    
    public Integer getNiveauDetail() { return niveauDetail; }
    public void setNiveauDetail(Integer niveauDetail) { this.niveauDetail = niveauDetail; }
    
    public boolean isExplicitationCompleteChatGPT() { return explicitationCompleteChatGPT; }
    public void setExplicitationCompleteChatGPT(boolean explicitationCompleteChatGPT) { 
        this.explicitationCompleteChatGPT = explicitationCompleteChatGPT; 
    }
    
    public String getLangue() { return langue; }
    public void setLangue(String langue) { this.langue = langue; }
    
    public String getContexteAdditionnel() { return contexteAdditionnel; }
    public void setContexteAdditionnel(String contexteAdditionnel) { this.contexteAdditionnel = contexteAdditionnel; }
}

