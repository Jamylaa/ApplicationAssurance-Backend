package tn.vermeg.gestionuser.dto;

import jakarta.validation.constraints.*;

public class ClientDTO {
    
    @NotBlank(message = "Le username ne peut pas être vide")
    @Pattern(regexp = "^[a-zA-Z]+(-[a-zA-Z]+)*$", 
             message = "Le username doit être un seul mot ou des mots séparés uniquement par des tirets (ex: jean, jean-marc)")
    @Size(min = 3, max = 30, message = "Le username doit contenir entre 3 et 30 caractères")
    private String userName;
    
    @NotBlank(message = "L'email ne peut pas être vide")
    @Email(message = "L'email doit avoir un format valide")
    private String email;
    
    @NotBlank(message = "Le mot de passe ne peut pas être vide")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*[0-9]).+$", 
             message = "Le mot de passe doit contenir au moins une lettre et un chiffre")
    private String password;
    
    @NotNull(message = "Le téléphone ne peut pas être vide")
    @Min(value = 20000000, message = "Le numéro de téléphone doit être valide")
    @Max(value = 99999999, message = "Le numéro de téléphone doit être valide")
    private Integer phone;
    
    private Integer age;
    
    @Pattern(regexp = "^(M|F|Homme|Femme)$", 
             message = "Le sexe doit être M, F, Homme ou Femme")
    private String sexe;
    
    private String profession;
    
    private String situationFamiliale;
    
    private Boolean maladieChronique = false;
    
    private Boolean diabetique = false;
    
    private Boolean tension = false;
    
    private Integer nombreBeneficiaires = 1;

    // Constructeurs
    public ClientDTO() {}

    public ClientDTO(String userName, String email, String password, Integer phone) {
        this.userName = userName;
        this.email = email;
        this.password = password;
        this.phone = phone;
    }

    // Getters et Setters
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
