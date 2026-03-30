package tn.vermeg.gestionuser.dto;
import tn.vermeg.gestionuser.entities.Departement;

public class RegisterRequest {

    private String userName;
    private String password;
    private String email;
    private int phone;
    private Departement departement;

    public Departement getDepartement() { return departement; }
    public void setDepartement(Departement departement) { this.departement = departement; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public int getPhone() { return phone; }
    public void setPhone(int phone) { this.phone = phone; }
}