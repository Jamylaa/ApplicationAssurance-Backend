package tn.vermeg.gestionproduit.entities;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "produits")
public class Produit {

    @Id
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
    @CreatedDate
    private Instant dateCreation;

    public String getIdProduit() {return idProduit;}
    public void setIdProduit(String idProduit) {this.idProduit = idProduit;}
    public String getNomProduit() {return nomProduit;}
    public void setNomProduit(String nomProduit) {this.nomProduit = nomProduit;}
    public String getDescription() {return description;}
    public void setDescription(String description) {
        this.description = description;
    }
    public List<String> getGarantiesIds() {
        return garantiesIds;
    }
    public void setGarantiesIds(List<String> garantiesIds) {
        this.garantiesIds = garantiesIds;
    }
    public double getPrixBase() {
        return prixBase;
    }
    public void setPrixBase(double prixBase) {
        this.prixBase = prixBase;
    }
    public int getAgeMin() {
        return ageMin;
    }
    public void setAgeMin(int ageMin) {
        this.ageMin = ageMin;
    }
    public int getAgeMax() {
        return ageMax;
    }
    public void setAgeMax(int ageMax) {
        this.ageMax = ageMax;
    }
    public boolean isMaladieChroniqueAutorisee() {
        return maladieChroniqueAutorisee;
    }
    public void setMaladieChroniqueAutorisee(boolean maladieChroniqueAutorisee) {this.maladieChroniqueAutorisee = maladieChroniqueAutorisee;}
    public boolean isDiabetiqueAutorise() {
        return diabetiqueAutorise;
    }
    public void setDiabetiqueAutorise(boolean diabetiqueAutorise) {
        this.diabetiqueAutorise = diabetiqueAutorise;
    }
    public boolean isActif() {
        return actif;
    }
    public void setActif(boolean actif) {
        this.actif = actif;
    }
    public Instant getDateCreation() {
        return dateCreation;
    }
    public void setDateCreation(Instant dateCreation) {
        this.dateCreation = dateCreation;
    }
    public Produit() {}
    public Produit(String idProduit, String nomProduit, String description, List<String> garantiesIds,
                   double prixBase, int ageMin, int ageMax,
                   boolean maladieChroniqueAutorisee, boolean diabetiqueAutorise,
                   boolean actif, Instant dateCreation) {
        this.idProduit = idProduit;
        this.nomProduit = nomProduit;
        this.description = description;
        this.garantiesIds = garantiesIds;
        this.prixBase = prixBase;
        this.ageMin = ageMin;
        this.ageMax = ageMax;
        this.maladieChroniqueAutorisee = maladieChroniqueAutorisee;
        this.diabetiqueAutorise = diabetiqueAutorise;
        this.actif = actif;
        this.dateCreation = dateCreation;
    }
}