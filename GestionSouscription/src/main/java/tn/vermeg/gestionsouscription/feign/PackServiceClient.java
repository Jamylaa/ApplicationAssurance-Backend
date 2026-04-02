package tn.vermeg.gestionsouscription.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.vermeg.gestionsouscription.dto.PackDTO;

@FeignClient(name = "GESTIONPRODUIT", path = "/api/packs", contextId = "packClient")
public interface PackServiceClient {
    @GetMapping("/{idPack}")
    PackDTO getPackById(@PathVariable("idPack") String idPack);
}
