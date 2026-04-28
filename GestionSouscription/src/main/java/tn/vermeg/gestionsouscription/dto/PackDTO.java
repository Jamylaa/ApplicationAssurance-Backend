package tn.vermeg.gestionsouscription.dto;

public class PackDTO {
    private String idPack;
    private String nomPack;
    private String description;
    private double prixMensuel;
    public PackDTO() {}
    public String getIdPack() { return idPack; }
    public void setIdPack(String idPack) { this.idPack = idPack; }
    public String getNomPack() { return nomPack; }
    public void setNomPack(String nomPack) { this.nomPack = nomPack; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getPrixMensuel() { return prixMensuel; }
    public void setPrixMensuel(double prixMensuel) { this.prixMensuel = prixMensuel; }
}
