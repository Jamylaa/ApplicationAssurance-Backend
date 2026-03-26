package tn.vermeg.gestionproduit.services;
import org.springframework.stereotype.Service;
import tn.vermeg.gestionproduit.entities.Produit;
import tn.vermeg.gestionproduit.repositories.ProduitRepository;
import java.util.List;
@Service
public class ProduitService {

    private final ProduitRepository produitRepository;
    public ProduitService(ProduitRepository produitRepository) {this.produitRepository = produitRepository;}

    public Produit createProduit(Produit produit) {
        return produitRepository.save(produit);
    }
    public Produit updateProduit(String idProduit, Produit produit) {produit.setIdProduit(idProduit);return produitRepository.save(produit);}
    public void deleteProduit(String idProduit) {
        produitRepository.deleteById(idProduit);
    }
    public Produit getProduitById(String idProduit) {
        return produitRepository.findById(idProduit).orElse(null);
    }
    public List<Produit> getAllProduits() {
        return produitRepository.findAll();
    }
}