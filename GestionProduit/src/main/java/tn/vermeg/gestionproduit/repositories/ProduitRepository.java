package tn.vermeg.gestionproduit.repositories;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.vermeg.gestionproduit.entities.Produit;

@Repository
public interface ProduitRepository extends MongoRepository<Produit, String> {
}