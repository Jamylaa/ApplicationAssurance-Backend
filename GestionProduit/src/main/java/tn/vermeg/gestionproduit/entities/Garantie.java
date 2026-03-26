package tn.vermeg.gestionproduit.entities;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
@Document(collection = "garanties")
public class Garantie {

    @Id
    private String idGarantie;
    private String nomGarantie;
    private String description;
    private TypeGarantie typeGarantie;
    private double plafondAnnuel;
    private double tauxCouverture; // pourcentage 0-100
    private boolean actif;
    @CreatedDate
    private Instant dateCreation;

    public Garantie() {}

    public Garantie(String idGarantie, String nomGarantie, String description,
                    TypeGarantie typeGarantie, double plafondAnnuel, double tauxCouverture,
                    boolean actif, Instant dateCreation) {
        this.idGarantie = idGarantie;
        this.nomGarantie = nomGarantie;
        this.description = description;
        this.typeGarantie = typeGarantie;
        this.plafondAnnuel = plafondAnnuel;
        this.tauxCouverture = tauxCouverture;
        this.actif = actif;
        this.dateCreation = dateCreation;
    }

    // Getters et Setters
    public String getIdGarantie() { return idGarantie; }
    public void setIdGarantie(String idGarantie) { this.idGarantie = idGarantie; }

    public String getNomGarantie() { return nomGarantie; }
    public void setNomGarantie(String nomGarantie) { this.nomGarantie = nomGarantie; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TypeGarantie getTypeGarantie() { return typeGarantie; }
    public void setTypeGarantie(TypeGarantie typeGarantie) { this.typeGarantie = typeGarantie; }

    public double getPlafondAnnuel() { return plafondAnnuel; }
    public void setPlafondAnnuel(double plafondAnnuel) { this.plafondAnnuel = plafondAnnuel; }

    public double getTauxCouverture() { return tauxCouverture; }
    public void setTauxCouverture(double tauxCouverture) { this.tauxCouverture = tauxCouverture; }

    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }

    public Instant getDateCreation() { return dateCreation; }
    public void setDateCreation(Instant dateCreation) { this.dateCreation = dateCreation; }
}