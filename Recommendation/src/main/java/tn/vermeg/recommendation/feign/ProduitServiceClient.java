package tn.vermeg.recommendation.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.vermeg.recommendation.dto.PackDTO;
import tn.vermeg.recommendation.dto.ProduitDTO;
import tn.vermeg.recommendation.dto.GarantieDTO;
import java.util.List;
 // Client Feign pour communiquer avec le microservice GestionProduit via Eureka.
@FeignClient(name = "GestionProduit")
public interface ProduitServiceClient {

    @GetMapping("/api/packs")
    List<PackDTO> getAllPacks();

    @GetMapping("/api/packs/{idPack}")
    PackDTO getPackById(@PathVariable("idPack") String idPack);

    @GetMapping("/api/produits")
    List<ProduitDTO> getAllProduits();

    @GetMapping("/api/produits/{idProduit}")
    ProduitDTO getProduitById(@PathVariable("idProduit") String idProduit);

    @GetMapping("/api/garanties")
    List<GarantieDTO> getAllGaranties();

    @GetMapping("/api/garanties/{idGarantie}")
    GarantieDTO getGarantieById(@PathVariable("idGarantie") String idGarantie);
}