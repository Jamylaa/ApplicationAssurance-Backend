package tn.vermeg.gestionuser.entities;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "users")
@TypeAlias("user")
    public abstract class User {

        @Id
        private String idUser;
        private String userName;
        private String email;
        private String password;
        private Integer phone;

        private Role role;
        private Boolean actif;
        private Date dateCreation;

    public String getIdUser() {return idUser;}
    public void setIdUser(String idUser) {this.idUser = idUser;}
    public String getUserName() {return userName;}
    public void setUserName(String userName) {this.userName = userName;}
    public String getEmail() {return email;}
    public void setEmail(String email) {this.email = email;}
    public String getPassword() {return password;}
    public void setPassword(String password) {this.password = password;}
    public Integer getPhone() {return phone;}
    public void setPhone(Integer phone) {this.phone = phone;}
    public Role getRole() {return role;}
    public void setRole(Role role) {this.role = role;}
    public Boolean getActif() {return actif; }
    public void setActif(Boolean actif) {this.actif = actif;}
    public Date getDateCreation() {return dateCreation;}
    public void setDateCreation(Date dateCreation) {this.dateCreation = dateCreation;}
    public User() {}
    public User(String idUser, String userName, String email,
                String password, Integer phone, Role role,
                Boolean actif, Date dateCreation) {
        this.idUser = idUser;
        this.userName = userName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
        this.actif = actif;
        this.dateCreation = dateCreation;
    }
}