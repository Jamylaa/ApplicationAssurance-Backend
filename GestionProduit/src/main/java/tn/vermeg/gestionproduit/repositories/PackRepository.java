package tn.vermeg.gestionproduit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.vermeg.gestionproduit.entities.NiveauCouverture;
import tn.vermeg.gestionproduit.entities.Pack;
import tn.vermeg.gestionproduit.entities.Statut;
import tn.vermeg.gestionproduit.entities.TypeClient;

import java.util.List;

@Repository
public interface PackRepository extends MongoRepository<Pack, String> {

    List<Pack> findByProduitId(String produitId);
    List<Pack> findByStatut(Statut statut);
    List<Pack> findByNomPackContainingIgnoreCase(String nom);
    boolean existsByNomPackIgnoreCase(String nom);
    List<Pack> findByPrixMensuelBetween(double prixMin, double prixMax);
    List<Pack> findByNiveauCouverture(NiveauCouverture niveauCouverture);
    List<Pack> findByTypeClientsContaining(TypeClient typeClient);
    List<Pack> findByProduitIdAndStatut(String produitId, Statut statut);
}