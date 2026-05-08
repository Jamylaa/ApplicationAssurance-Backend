package tn.vermeg.recommendation.entities;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "questionnaire_responses")
public class QuestionnaireResponse {

    @Id
    private String id;
    private String clientId;
    // Profil démographique
    private int age;
    private String sexe;
    private String profession;
    private String situationFamiliale;
    // Santé
    private boolean maladieChronique;
    private boolean diabetique;
    private boolean tension;
    private boolean maladiesLegeres;
    // Besoins
    private int nombreBeneficiaires;
    private int dureeContratSouhaitee; // en mois
    private double budgetMensuel;
    public QuestionnaireResponse(String id, String clientId, int age, String sexe,
                                 String profession, String situationFamiliale, boolean maladieChronique,
                                 boolean diabetique, boolean tension, boolean maladiesLegeres,
                                 int nombreBeneficiaires, int dureeContratSouhaitee,
                                 double budgetMensuel, Date dateReponse) {
        this.id = id;
        this.clientId = clientId;
        this.age = age;
        this.sexe = sexe;
        this.profession = profession;
        this.situationFamiliale = situationFamiliale;
        this.maladieChronique = maladieChronique;
        this.diabetique = diabetique;
        this.tension = tension;
        this.maladiesLegeres = maladiesLegeres;
        this.nombreBeneficiaires = nombreBeneficiaires;
        this.dureeContratSouhaitee = dureeContratSouhaitee;
        this.budgetMensuel = budgetMensuel;
        this.dateReponse = dateReponse;
    }

    // Métadonnées
    private Date dateReponse;
    public QuestionnaireResponse() {}
    // Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
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
    public boolean isMaladiesLegeres() { return maladiesLegeres; }
    public void setMaladiesLegeres(boolean maladiesLegeres) { this.maladiesLegeres = maladiesLegeres; }
    public int getNombreBeneficiaires() { return nombreBeneficiaires; }
    public void setNombreBeneficiaires(int nombreBeneficiaires) { this.nombreBeneficiaires = nombreBeneficiaires; }
    public int getDureeContratSouhaitee() { return dureeContratSouhaitee; }
    public void setDureeContratSouhaitee(int dureeContratSouhaitee) { this.dureeContratSouhaitee = dureeContratSouhaitee; }
    public double getBudgetMensuel() { return budgetMensuel; }
    public void setBudgetMensuel(double budgetMensuel) { this.budgetMensuel = budgetMensuel; }
    public Date getDateReponse() { return dateReponse; }
    public void setDateReponse(Date dateReponse) { this.dateReponse = dateReponse; }
}