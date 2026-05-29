package tn.vermeg.gestionproduit.dto;

import java.util.List;
import java.util.Map;

/**
 * Représente un produit/pack/garantie recommandé avec son score et son explication
 */
public class RecommendedItemDTO {
    
    private String idProduit;
    private String nomProduit;
    private String type; // PRODUIT, PACK, GARANTIE
    private String description;
    private Double scoreRecommandation; // 0 à 100
    private Double prixMensuel;
    
    // Détails de la recommandation
    private String raison; // Pourquoi ce produit est recommandé
    private List<String> avantages; // Avantages pour ce client
    private List<String> considerationsPertinentes; // Points à considérer
    
    // Paramètres du produit
    private Map<String, Object> caracteristiques;
    
    // Score détaillé
    private RecommendationScoreDTO score;
    
    // Constructeurs
    public RecommendedItemDTO() {
        this.scoreRecommandation = 0.0;
    }
    
    public RecommendedItemDTO(String idProduit, String nomProduit, String type, Double scoreRecommandation) {
        this.idProduit = idProduit;
        this.nomProduit = nomProduit;
        this.type = type;
        this.scoreRecommandation = scoreRecommandation;
    }
    
    // Getters & Setters
    public String getIdProduit() { return idProduit; }
    public void setIdProduit(String idProduit) { this.idProduit = idProduit; }
    
    public String getNomProduit() { return nomProduit; }
    public void setNomProduit(String nomProduit) { this.nomProduit = nomProduit; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Double getScoreRecommandation() { return scoreRecommandation; }
    public void setScoreRecommandation(Double scoreRecommandation) { this.scoreRecommandation = scoreRecommandation; }
    
    public Double getPrixMensuel() { return prixMensuel; }
    public void setPrixMensuel(Double prixMensuel) { this.prixMensuel = prixMensuel; }
    
    public String getRaison() { return raison; }
    public void setRaison(String raison) { this.raison = raison; }
    
    public List<String> getAvantages() { return avantages; }
    public void setAvantages(List<String> avantages) { this.avantages = avantages; }
    
    public List<String> getConsiderationsPertinentes() { return considerationsPertinentes; }
    public void setConsiderationsPertinentes(List<String> considerationsPertinentes) { 
        this.considerationsPertinentes = considerationsPertinentes; 
    }
    
    public Map<String, Object> getCaracteristiques() { return caracteristiques; }
    public void setCaracteristiques(Map<String, Object> caracteristiques) { this.caracteristiques = caracteristiques; }
    
    public RecommendationScoreDTO getScore() { return score; }
    public void setScore(RecommendationScoreDTO score) { this.score = score; }
}

