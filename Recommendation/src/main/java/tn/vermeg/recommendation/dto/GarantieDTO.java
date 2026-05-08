package tn.vermeg.recommendation.dto;

import java.util.Date;

public class GarantieDTO {

    private String idGarantie;
    private String nomGarantie;
    private String description;
    private String typeGarantie;
    private double plafondAnnuel;
    private double tauxCouverture;
    private boolean actif;
    private Date dateCreation;
    public GarantieDTO() {}
    public GarantieDTO(String idGarantie, String nomGarantie,
                       String description, String typeGarantie,
                       double plafondAnnuel, double tauxCouverture,
                       boolean actif, Date dateCreation) {
        this.idGarantie = idGarantie;
        this.nomGarantie = nomGarantie;
        this.description = description;
        this.typeGarantie = typeGarantie;
        this.plafondAnnuel = plafondAnnuel;
        this.tauxCouverture = tauxCouverture;
        this.actif = actif;
        this.dateCreation = dateCreation;}
    public String getIdGarantie() { return idGarantie; }
    public void setIdGarantie(String idGarantie) { this.idGarantie = idGarantie; }
    public String getNomGarantie() { return nomGarantie; }
    public void setNomGarantie(String nomGarantie) { this.nomGarantie = nomGarantie; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTypeGarantie() { return typeGarantie; }
    public void setTypeGarantie(String typeGarantie) { this.typeGarantie = typeGarantie; }
    public double getPlafondAnnuel() { return plafondAnnuel; }
    public void setPlafondAnnuel(double plafondAnnuel) { this.plafondAnnuel = plafondAnnuel; }
    public double getTauxCouverture() { return tauxCouverture; }
    public void setTauxCouverture(double tauxCouverture) { this.tauxCouverture = tauxCouverture; }
    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
    public Date getDateCreation() { return dateCreation; }
    public void setDateCreation(Date dateCreation) { this.dateCreation = dateCreation; }
}