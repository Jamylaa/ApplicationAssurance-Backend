package tn.vermeg.gestionproduit.services;
import org.springframework.stereotype.Service;
import tn.vermeg.gestionproduit.entities.Garantie;
import tn.vermeg.gestionproduit.entities.TypeGarantie;
import tn.vermeg.gestionproduit.repositories.GarantieRepository;
import java.util.List;

@Service
public class GarantieService {

    private final GarantieRepository garantieRepository;

    public GarantieService(GarantieRepository garantieRepository) {
        this.garantieRepository = garantieRepository;
    }
    public Garantie createGarantie(Garantie garantie) {
        return garantieRepository.save(garantie);
    }
    public Garantie updateGarantie(String idGarantie, Garantie garantie) {garantie.setIdGarantie(idGarantie);return garantieRepository.save(garantie);}
    public void deleteGarantie(String idGarantie) {
        garantieRepository.deleteById(idGarantie);
    }
    public Garantie getGarantieById(String idGarantie) {
        return garantieRepository.findById(idGarantie).orElse(null);
    }
    public List<Garantie> getAllGaranties() {
        return garantieRepository.findAll();
    }
    public List<Garantie> getGarantiesByType(TypeGarantie typeGarantie) {return garantieRepository.findByTypeGarantie(typeGarantie);}
    public List<Garantie> getGarantiesActives() {
        return garantieRepository.findByActif(true);
    }
}