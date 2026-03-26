package tn.vermeg.gestionsouscription.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.vermeg.gestionsouscription.entities.Contrat;

import java.util.List;

@Repository
public interface ContratRepository extends MongoRepository<Contrat, String> {

    List<Contrat> findByClientId(String clientId);

    List<Contrat> findByProduitId(String produitId);

    List<Contrat> findByStatut(String statut);

    List<Contrat> findByClientEmail(String clientEmail);
}