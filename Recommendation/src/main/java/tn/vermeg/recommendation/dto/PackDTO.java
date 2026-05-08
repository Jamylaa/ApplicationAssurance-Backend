package tn.vermeg.recommendation.dto;
import java.util.Date;
import java.util.List;
public class PackDTO {

    private String idPack;
    private String nomPack;
    private String description;
    private List<String> produitsIds;
    private double prixMensuel;
    private int dureeMinContrat;
    private int dureeMaxContrat;
    private String niveauCouverture; // basic, premium, gold
    private boolean actif;
    private Date dateCreation;
    public PackDTO() {}
    public String getIdPack() { return idPack; }
    public void setIdPack(String idPack) { this.idPack = idPack; }
    public PackDTO(String idPack, String nomPack, String description, List<String> produitsIds,
                   double prixMensuel, int dureeMinContrat, int dureeMaxContrat,
                   String niveauCouverture, boolean actif, Date dateCreation) {
        this.idPack = idPack;
        this.nomPack = nomPack;
        this.description = description;
        this.produitsIds = produitsIds;
        this.prixMensuel = prixMensuel;
        this.dureeMinContrat = dureeMinContrat;
        this.dureeMaxContrat = dureeMaxContrat;
        this.niveauCouverture = niveauCouverture;
        this.actif = actif;
        this.dateCreation = dateCreation;}
    public String getNomPack() { return nomPack; }
    public void setNomPack(String nomPack) { this.nomPack = nomPack; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getProduitsIds() { return produitsIds; }
    public void setProduitsIds(List<String> produitsIds) { this.produitsIds = produitsIds; }
    public double getPrixMensuel() { return prixMensuel; }
    public void setPrixMensuel(double prixMensuel) { this.prixMensuel = prixMensuel; }
    public int getDureeMinContrat() { return dureeMinContrat; }
    public void setDureeMinContrat(int dureeMinContrat) { this.dureeMinContrat = dureeMinContrat; }
    public int getDureeMaxContrat() { return dureeMaxContrat; }
    public void setDureeMaxContrat(int dureeMaxContrat) { this.dureeMaxContrat = dureeMaxContrat; }
    public String getNiveauCouverture() { return niveauCouverture; }
    public void setNiveauCouverture(String niveauCouverture) { this.niveauCouverture = niveauCouverture; }
    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
    public Date getDateCreation() { return dateCreation; }
    public void setDateCreation(Date dateCreation) { this.dateCreation = dateCreation; }
}