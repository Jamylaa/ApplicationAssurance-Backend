package tn.vermeg.gestionuser.dto;

public class RegisterRequest {

    private String userName;
    private String password;
    private String email;
    private long phone;
    private String departement;
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public long getPhone() { return phone; }
    public void setPhone(long phone) { this.phone = phone; }
    public String getDepartement() { return departement; }
    public void setDepartement(String departement) { this.departement = departement; }
}