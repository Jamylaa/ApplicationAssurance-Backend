package tn.vermeg.gestionuser.entities;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "clients")
public class Client extends User {
    private Integer age;
    private String sexe;
    private String profession;
    private String situationFamiliale;
    private Boolean maladieChronique;
    private Boolean diabetique;
    private Boolean tension;
    private Integer nombreBeneficiaires;

    public Client() {}
    public Client(String idUser, String userName, String email, String password, Integer phone, 
                  Integer age, String sexe, String profession,
                  String situationFamiliale, Boolean maladieChronique,
                  Boolean diabetique, Boolean tension, Integer nombreBeneficiaires) {
        super(idUser, userName, email, password, phone, Role.CLIENT, true, new java.util.Date());
        this.age = age;
        this.sexe = sexe;
        this.profession = profession;
        this.situationFamiliale = situationFamiliale;
        this.maladieChronique = maladieChronique;
        this.diabetique = diabetique;
        this.tension = tension;
        this.nombreBeneficiaires = nombreBeneficiaires;
    }

    // Getters et Setters
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getSexe() { return sexe; }
    public void setSexe(String sexe) { this.sexe = sexe; }

    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }

    public String getSituationFamiliale() { return situationFamiliale; }
    public void setSituationFamiliale(String situationFamiliale) { this.situationFamiliale = situationFamiliale; }

    public Boolean isMaladieChronique() { return maladieChronique; }
    public void setMaladieChronique(Boolean maladieChronique) { this.maladieChronique = maladieChronique; }

    public Boolean isDiabetique() { return diabetique; }
    public void setDiabetique(Boolean diabetique) { this.diabetique = diabetique; }

    public Boolean isTension() { return tension; }
    public void setTension(Boolean tension) { this.tension = tension; }

    public Integer getNombreBeneficiaires() { return nombreBeneficiaires; }
    public void setNombreBeneficiaires(Integer nombreBeneficiaires) { this.nombreBeneficiaires = nombreBeneficiaires; }
}
