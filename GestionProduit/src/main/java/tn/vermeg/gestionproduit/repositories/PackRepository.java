package tn.vermeg.gestionproduit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.vermeg.gestionproduit.entities.Pack;
import tn.vermeg.gestionproduit.entities.TypeProduit;

import java.util.List;

@Repository
public interface PackRepository extends MongoRepository<Pack, String> {
    List<Pack> findByTypeProduitAndActif(TypeProduit typeProduit, boolean actif);
    List<Pack> findPackByTypeProduit(TypeProduit typeProduit);
}