package tn.vermeg.gestionuser.dto;

public class ClientResponseDTO {
    private String idUser;
    private String userName;
    private String email;
    private Integer phone;
    private Integer age;
    private String sexe;
    private String profession;
    private String situationFamiliale;
    private Boolean maladieChronique;
    private Boolean diabetique;
    private Boolean tension;
    private Integer nombreBeneficiaires;
  //  private String role;
    private Boolean actif;
    // Constructeurs
    public ClientResponseDTO() {}
    // Getters et Setters
    public String getIdUser() {
        return idUser;
    }
    public void setIdUser(String idUser) {
        this.idUser = idUser;
    }
    public String getUserName() {
        return userName;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public Integer getPhone() {
        return phone;
    }
    public void setPhone(Integer phone) {
        this.phone = phone;
    }
    public Integer getAge() {
        return age;
    }
    public void setAge(Integer age) {
        this.age = age;
    }
    public String getSexe() {
        return sexe;
    }
    public void setSexe(String sexe) {
        this.sexe = sexe;
    }
    public String getProfession() {
        return profession;
    }
    public void setProfession(String profession) {
        this.profession = profession;
    }
    public String getSituationFamiliale() {
        return situationFamiliale;
    }
    public void setSituationFamiliale(String situationFamiliale) {
        this.situationFamiliale = situationFamiliale;
    }
    public Boolean isMaladieChronique() {
        return maladieChronique;
    }
    public void setMaladieChronique(Boolean maladieChronique) {
        this.maladieChronique = maladieChronique;
    }
    public Boolean isDiabetique() {
        return diabetique;
    }
    public void setDiabetique(Boolean diabetique) {
        this.diabetique = diabetique;
    }
    public Boolean isTension() {
        return tension;
    }
    public void setTension(Boolean tension) {
        this.tension = tension;
    }
    public Integer getNombreBeneficiaires() {
        return nombreBeneficiaires;
    }
    public void setNombreBeneficiaires(Integer nombreBeneficiaires) {
        this.nombreBeneficiaires = nombreBeneficiaires;
    }
//    public String getRole() {
//        return role;
//    }
//    public void setRole(String role) {
//        this.role = role;
//    }
//    public Boolean getActif() {
//        return actif;
//    }
    public void setActif(Boolean actif) {
        this.actif = actif;
    }
}