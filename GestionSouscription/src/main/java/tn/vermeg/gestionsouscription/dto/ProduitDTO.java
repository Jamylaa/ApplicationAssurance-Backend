package tn.vermeg.gestionsouscription.dto;

import java.util.Date;
import java.util.List;

/**
 * DTO miroir de l'entité Produit du microservice GestionProduit.
 * Utilisé pour recevoir les données via Feign sans dépendance directe.
 */
public class ProduitDTO {

    private String idProduit;
    private String nomProduit;
    private String description;
    private List<String> garantiesIds;
    private double prixBase;
    private int ageMin;
    private int ageMax;
    private boolean maladieChroniqueAutorisee;
    private boolean diabetiqueAutorise;
    private boolean actif;
    private Date dateCreation;

    public ProduitDTO() {}

    // Getters et Setters
    public String getIdProduit() { return idProduit; }
    public void setIdProduit(String idProduit) { this.idProduit = idProduit; }

    public String getNomProduit() { return nomProduit; }
    public void setNomProduit(String nomProduit) { this.nomProduit = nomProduit; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getGarantiesIds() { return garantiesIds; }
    public void setGarantiesIds(List<String> garantiesIds) { this.garantiesIds = garantiesIds; }

    public double getPrixBase() { return prixBase; }
    public void setPrixBase(double prixBase) { this.prixBase = prixBase; }

    public int getAgeMin() { return ageMin; }
    public void setAgeMin(int ageMin) { this.ageMin = ageMin; }

    public int getAgeMax() { return ageMax; }
    public void setAgeMax(int ageMax) { this.ageMax = ageMax; }

    public boolean isMaladieChroniqueAutorisee() { return maladieChroniqueAutorisee; }
    public void setMaladieChroniqueAutorisee(boolean maladieChroniqueAutorisee) { this.maladieChroniqueAutorisee = maladieChroniqueAutorisee; }

    public boolean isDiabetiqueAutorise() { return diabetiqueAutorise; }
    public void setDiabetiqueAutorise(boolean diabetiqueAutorise) { this.diabetiqueAutorise = diabetiqueAutorise; }

    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }

    public Date getDateCreation() { return dateCreation; }
    public void setDateCreation(Date dateCreation) { this.dateCreation = dateCreation; }
}
