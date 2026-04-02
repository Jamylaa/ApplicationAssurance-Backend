package tn.vermeg.gestionuser.entities;

import jakarta.validation.constraints.*;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "agents")
@TypeAlias("agent")
public class Agent extends User {
    
    @NotBlank(message = "Le service ne peut pas être vide")
    private String service;
    @NotNull(message = "Le grade ne peut pas être vide")
    private String grade;
    @Pattern(regexp = "^(M|F|Homme|Femme)$", 
             message = "Le sexe doit être M, F, Homme ou Femme")
    private String sexe;
    private Integer age;
    public Agent() {}
    public Agent(String idUser, String userName, String email, String password, Integer phone, 
                 String service, String grade, String sexe, Integer age) {
        super(idUser, userName, email, password, phone, Role.AGENT, true, new java.util.Date());
        this.service = service;
        this.grade = grade;
        this.sexe = sexe;
        this.age = age;
    }

    // Getters et Setters
    public String getService() { return service; }
    public void setService(String service) { this.service = service; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public String getSexe() { return sexe; }
    public void setSexe(String sexe) { this.sexe = sexe; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}