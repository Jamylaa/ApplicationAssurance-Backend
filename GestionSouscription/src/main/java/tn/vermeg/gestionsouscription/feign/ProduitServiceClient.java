package tn.vermeg.gestionsouscription.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.vermeg.gestionsouscription.dto.ProduitDTO;

import java.util.List;

/**
 * Feign client pour communiquer avec le microservice GestionProduit.
 * Le nom "GESTIONPRODUIT" doit correspondre au spring.application.name du service Produit enregistré dans Eureka.
 */
@FeignClient(name = "GESTIONPRODUIT", path = "/api/produits")
public interface ProduitServiceClient {

    @GetMapping("/{idProduit}")
    ProduitDTO getProduitById(@PathVariable("idProduit") String idProduit);

    @GetMapping
    List<ProduitDTO> getAllProduits();
}
