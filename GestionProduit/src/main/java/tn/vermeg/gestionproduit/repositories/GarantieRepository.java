package tn.vermeg.gestionproduit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.vermeg.gestionproduit.entities.Garantie;
import tn.vermeg.gestionproduit.entities.Statut;
import tn.vermeg.gestionproduit.entities.TypeGarantie;

import java.util.List;

@Repository
public interface GarantieRepository extends MongoRepository<Garantie, String> {

    List<Garantie> findByTypeGarantie(TypeGarantie typeGarantie);
    List<Garantie> findByStatut(Statut statut);
    List<Garantie> findByNomGarantieContainingIgnoreCase(String nomGarantie);
    boolean existsByNomGarantieIgnoreCase(String nomGarantie);
    List<Garantie> findByTauxRemboursementGreaterThanEqual(double tauxMin);
    List<Garantie> findByPlafondAnnuelGreaterThanEqual(double plafondMin);
}