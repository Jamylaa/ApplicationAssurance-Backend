package tn.vermeg.gestionproduit.services;
import org.springframework.stereotype.Service;
import tn.vermeg.gestionproduit.entities.Pack;
import tn.vermeg.gestionproduit.entities.TypeProduit;
import tn.vermeg.gestionproduit.repositories.PackRepository;
import java.util.List;

@Service
public class PackService {

    private final PackRepository packRepository;
    public PackService(PackRepository packRepository) {this.packRepository = packRepository;}

    public Pack createPack(Pack pack) {
        return packRepository.save(pack);
    }
    public Pack updatePack(String idPack, Pack pack) {pack.setIdPack(idPack);return packRepository.save(pack);}
    public void deletePack(String idPack) {packRepository.deleteById(idPack);}
    public Pack getPackById(String idPack) {
        return packRepository.findById(idPack).orElse(null);
    }
    public List<Pack> getAllPacks() {return packRepository.findAll();}
    public List<Pack> getPacksByType(TypeProduit type) {return packRepository.findByTypeProduitAndActif(type, true);}
}