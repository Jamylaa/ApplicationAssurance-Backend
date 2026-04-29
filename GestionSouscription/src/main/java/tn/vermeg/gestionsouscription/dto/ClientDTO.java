package tn.vermeg.gestionsouscription.dto;
import java.util.Date;
 // DTO miroir de l'entité Client du microservice GestionUser.
 //Utilisé pour recevoir les données via Feign sans dépendance directe.
public class ClientDTO {

    private String idUser;
    private String userName;
    private String email;
    private Integer phone;
    private String role;
    private boolean actif;
    private Date dateCreation;

    // Champs spécifiques Client
    private Integer age;
    private String sexe;
    private String profession;
    private String situationFamiliale;
    private boolean maladieChronique;
    private boolean diabetique;
    private boolean tension;
    private int nombreBeneficiaires;
    private String numeroCIN;
    private String clientPrenom;

    public ClientDTO() {}

    // Getters et Setters
    public String getIdUser() { return idUser; }
    public void setIdUser(String idUser) { this.idUser = idUser; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Integer getPhone() { return  phone; }
    public void setPhone(Integer phone) { this.phone = phone; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
    public Date getDateCreation() { return dateCreation; }
    public void setDateCreation(Date dateCreation) { this.dateCreation = dateCreation; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getSexe() { return sexe; }
    public void setSexe(String sexe) { this.sexe = sexe; }
    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }
    public String getSituationFamiliale() { return situationFamiliale; }
    public void setSituationFamiliale(String situationFamiliale) { this.situationFamiliale = situationFamiliale; }
    public boolean isMaladieChronique() { return maladieChronique; }
    public void setMaladieChronique(boolean maladieChronique) { this.maladieChronique = maladieChronique; }
    public boolean isDiabetique() { return diabetique; }
    public void setDiabetique(boolean diabetique) { this.diabetique = diabetique; }
    public boolean isTension() { return tension; }
    public void setTension(boolean tension) { this.tension = tension; }
    public int getNombreBeneficiaires() { return nombreBeneficiaires; }
    public void setNombreBeneficiaires(int nombreBeneficiaires) { this.nombreBeneficiaires = nombreBeneficiaires; }
    public String getNumeroCIN() { return numeroCIN; }
    public void setNumeroCIN(String numeroCIN) { this.numeroCIN = numeroCIN; }
    public String getClientPrenom() { return clientPrenom; }
    public void setClientPrenom(String clientPrenom) { this.clientPrenom = clientPrenom; }
}