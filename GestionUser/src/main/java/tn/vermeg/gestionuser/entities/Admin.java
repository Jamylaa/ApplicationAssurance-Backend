package tn.vermeg.gestionuser.entities;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "admins")
@TypeAlias("admin")
public class Admin extends User {
    private Departement departement;

    public Departement getDepartement() {return departement;}
    public void setDepartement(Departement departement) {this.departement = departement;}
}