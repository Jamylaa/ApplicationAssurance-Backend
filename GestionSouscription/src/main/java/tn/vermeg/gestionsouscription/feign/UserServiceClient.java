package tn.vermeg.gestionsouscription.feign;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.vermeg.gestionsouscription.dto.ClientDTO;
import java.util.List;
 // Feign client pour communiquer avec le microservice GestionUser.
 // Le nom "GESTIONUSER" doit correspondre au spring.application.name du service User enregistré dans Eureka.
@FeignClient(name = "GESTIONUSER", path = "/api/clients", contextId = "userClient")
public interface UserServiceClient {
    @GetMapping("/{idUser}")
    ClientDTO getClientById(@PathVariable("idUser") String idUser);
    @GetMapping()
    List<ClientDTO> getAllClients();
}