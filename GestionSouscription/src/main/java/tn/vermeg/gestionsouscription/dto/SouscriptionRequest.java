package tn.vermeg.gestionsouscription.dto;
import java.util.Date;
 // Requête de souscription envoyée par le frontend.
 //Contient l'ID du client (de GestionUser) et l'ID du produit (de GestionProduit).
public class SouscriptionRequest {

    private String clientId;        // ID du client dans GestionUser
    private String produitId;       // ID du produit dans GestionProduit
    private String packId;          // ID du pack sélectionné (optionnel)
    private Date dateDebut;
    private int dureeMois;
    private double primePersonnalisee; // Si 0 ou non renseignée, on utilise le prixBase du produit
    private String optionsSupplementaires;
    public SouscriptionRequest() {}
    // Getters et Setters
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public String getProduitId() { return produitId; }
    public void setProduitId(String produitId) { this.produitId = produitId; }
    public String getPackId() { return packId; }
    public void setPackId(String packId) { this.packId = packId; }
    public Date getDateDebut() { return dateDebut; }
    public void setDateDebut(Date dateDebut) { this.dateDebut = dateDebut; }
    public int getDureeMois() { return dureeMois; }
    public void setDureeMois(int dureeMois) { this.dureeMois = dureeMois; }
    public double getPrimePersonnalisee() { return primePersonnalisee; }
    public void setPrimePersonnalisee(double primePersonnalisee) { this.primePersonnalisee = primePersonnalisee; }
    public String getOptionsSupplementaires() { return optionsSupplementaires; }
    public void setOptionsSupplementaires(String optionsSupplementaires) { this.optionsSupplementaires = optionsSupplementaires; }
}