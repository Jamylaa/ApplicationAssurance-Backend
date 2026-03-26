package tn.vermeg.gestionproduit.entities;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
@Document(collection = "packs")
public class Pack {

    @Id
    private String idPack;
    private String nomPack;
    private String description;
    private List<String> produitsIds;
    private double prixMensuel;
    private int dureeMinContrat;
    private int dureeMaxContrat;
    private NiveauCouverture niveauCouverture;
    private boolean actif;
    @CreatedDate
    private Instant dateCreation;

    public Instant getDateCreation() {return dateCreation;}
    public void setDateCreation(Instant dateCreation) {this.dateCreation = dateCreation;}
    public boolean isActif() {return actif;}
    public void setActif(boolean actif) {this.actif = actif;}
    public NiveauCouverture getNiveauCouverture(){return niveauCouverture;}
    public void setNiveauCouverture(NiveauCouverture niveauCouverture) {this.niveauCouverture = niveauCouverture;}
    public int getDureeMaxContrat() {return dureeMaxContrat;}
    public void setDureeMaxContrat(int dureeMaxContrat) {
        this.dureeMaxContrat = dureeMaxContrat;
    }
    public int getDureeMinContrat() {
        return dureeMinContrat;
    }
    public void setDureeMinContrat(int dureeMinContrat) {this.dureeMinContrat = dureeMinContrat;}
    public double getPrixMensuel() {
        return prixMensuel;
    }
    public void setPrixMensuel(double prixMensuel) {
        this.prixMensuel = prixMensuel;
    }
    public List<String> getProduitsIds() {
        return produitsIds;
    }
    public void setProduitsIds(List<String> produitsIds) {
        this.produitsIds = produitsIds;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getNomPack() {
        return nomPack;
    }
    public void setNomPack(String nomPack) {
        this.nomPack = nomPack;
    }
    public String getIdPack() {
        return idPack;
    }
    public void setIdPack(String idPack) {
        this.idPack = idPack;
    }

    public Pack() {}
    public Pack(String idPack, String nomPack, String description, List<String> produitsIds,
                double prixMensuel, int dureeMinContrat, int dureeMaxContrat,
                NiveauCouverture niveauCouverture, boolean actif, Instant dateCreation) {
        this.idPack = idPack;
        this.nomPack = nomPack;
        this.description = description;
        this.produitsIds = produitsIds;
        this.prixMensuel = prixMensuel;
        this.dureeMinContrat = dureeMinContrat;
        this.dureeMaxContrat = dureeMaxContrat;
        this.niveauCouverture = niveauCouverture;
        this.actif = actif;
        this.dateCreation = dateCreation;
    }
}