package tn.vermeg.gestionproduit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import tn.vermeg.gestionproduit.entities.Garantie;
import tn.vermeg.gestionproduit.entities.TypeGarantie;
import java.util.List;

public interface GarantieRepository extends MongoRepository<Garantie, String> {
    List<Garantie> findByTypeGarantie(TypeGarantie typeGarantie);
    List<Garantie> findByActif(boolean actif);
}
