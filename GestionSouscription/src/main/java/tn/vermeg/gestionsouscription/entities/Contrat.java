package tn.vermeg.gestionsouscription.entities;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

/**
 * Contrat d'assurance créé lors d'une souscription.
 * Contient un snapshot des informations client et produit au moment de la souscription,
 * pour garder une trace même si les données source changent ultérieurement.
 */
@Document(collection = "contrats")
public class Contrat {
    @Id
    private String idContrat;

    // --- Référence et snapshot Client ---
    private String clientId;
    private String clientNom;
    private String clientPrenom;
    private String clientCIN;
    private String clientEmail;
    private Integer clientPhone;
    private Integer clientAge;
    private String clientSexe;
    private String clientProfession;
    private String clientSituationFamiliale;

    // --- Référence et snapshot Produit ---
    private String produitId;
    private String produitNom;
    private String produitDescription;
    private double produitPrixBase;
    private List<String> produitGarantiesIds;

    // --- Snapshot Pack ---
    private String packId;
    private String packNom;

    // --- Détails du contrat ---
    private Date dateDebut;
    private Date dateFin;
    private int dureeMois;
    private double primeTotale;
    private String statut; // "ACTIF", "EXPIRE", "RESILIE", "EN_ATTENTE"

    @CreatedDate
    private Date dateCreation;

    @LastModifiedDate
    private Date dateModification;

    private String optionsSupplementaires;

    public Contrat() {}

    // Getters et Setters
    public String getIdContrat() { return idContrat; }
    public void setIdContrat(String idContrat) { this.idContrat = idContrat; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientNom() { return clientNom; }
    public void setClientNom(String clientNom) { this.clientNom = clientNom; }

    public String getClientPrenom() { return clientPrenom; }
    public void setClientPrenom(String clientPrenom) { this.clientPrenom = clientPrenom; }

    public String getClientCIN() { return clientCIN; }
    public void setClientCIN(String clientCIN) { this.clientCIN = clientCIN; }

    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }

    public Integer getClientPhone() { return clientPhone; }
    public void setClientPhone(Integer clientPhone) { this.clientPhone = clientPhone; }

    public Integer getClientAge() { return clientAge; }
    public void setClientAge(Integer clientAge) { this.clientAge = clientAge; }

    public String getClientSexe() { return clientSexe; }
    public void setClientSexe(String clientSexe) { this.clientSexe = clientSexe; }

    public String getClientProfession() { return clientProfession; }
    public void setClientProfession(String clientProfession) { this.clientProfession = clientProfession; }

    public String getClientSituationFamiliale() { return clientSituationFamiliale; }
    public void setClientSituationFamiliale(String clientSituationFamiliale) { this.clientSituationFamiliale = clientSituationFamiliale; }

    public String getProduitId() { return produitId; }
    public void setProduitId(String produitId) { this.produitId = produitId; }

    public String getProduitNom() { return produitNom; }
    public void setProduitNom(String produitNom) { this.produitNom = produitNom; }

    public String getProduitDescription() { return produitDescription; }
    public void setProduitDescription(String produitDescription) { this.produitDescription = produitDescription; }

    public double getProduitPrixBase() { return produitPrixBase; }
    public void setProduitPrixBase(double produitPrixBase) { this.produitPrixBase = produitPrixBase; }

    public List<String> getProduitGarantiesIds() { return produitGarantiesIds; }
    public void setProduitGarantiesIds(List<String> produitGarantiesIds) { this.produitGarantiesIds = produitGarantiesIds; }

    public Date getDateDebut() { return dateDebut; }
    public void setDateDebut(Date dateDebut) { this.dateDebut = dateDebut; }

    public Date getDateFin() { return dateFin; }
    public void setDateFin(Date dateFin) { this.dateFin = dateFin; }

    public int getDureeMois() { return dureeMois; }
    public void setDureeMois(int dureeMois) { this.dureeMois = dureeMois; }

    public double getPrimeTotale() { return primeTotale; }
    public void setPrimeTotale(double primeTotale) { this.primeTotale = primeTotale; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public Date getDateCreation() { return dateCreation; }
    public void setDateCreation(Date dateCreation) { this.dateCreation = dateCreation; }

    public Date getDateModification() { return dateModification; }
    public void setDateModification(Date dateModification) { this.dateModification = dateModification; }

    public String getOptionsSupplementaires() { return optionsSupplementaires; }
    public void setOptionsSupplementaires(String optionsSupplementaires) { this.optionsSupplementaires = optionsSupplementaires; }

    public String getPackId() { return packId; }
    public void setPackId(String packId) { this.packId = packId; }

    public String getPackNom() { return packNom; }
    public void setPackNom(String packNom) { this.packNom = packNom; }
}