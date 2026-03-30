package tn.vermeg.gestionuser.controllers;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionuser.entities.Client;
import tn.vermeg.gestionuser.dto.ValidationResult;
import tn.vermeg.gestionuser.services.ClientService;
import java.util.List;

@RestController
@RequestMapping("/api/clients")
//@CrossOrigin(origins = "http://localhost:4200")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public ResponseEntity<List<Client>> getAllClients() {
        List<Client> clients = clientService.getAllClients();
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{idUser}")
    public ResponseEntity<Client> getClientById(@PathVariable String idUser) {
        try {
            Client client = clientService.getClientById(idUser);
            return ResponseEntity.ok(client);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createClient(@RequestBody Client client) {
        try {
            Client createdClient = clientService.createClient(client);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdClient);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PutMapping("/{idUser}")
    public ResponseEntity<?> updateClient(@PathVariable String idUser, @RequestBody Client client) {
        try {
            Client updatedClient = clientService.updateClient(idUser, client);
            return ResponseEntity.ok(updatedClient);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{idUser}")
    public ResponseEntity<Void> deleteClient(@PathVariable String idUser) {
        try {
            clientService.deleteClient(idUser);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/validate-username")
    public ResponseEntity<ValidationResult> validateUsername(@RequestParam String username) {
        ValidationResult result = clientService.validateUsername(username);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/validate-email")
    public ResponseEntity<ValidationResult> validateEmail(@RequestParam String email) {
        ValidationResult result = clientService.validateEmail(email);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Client>> searchClients(@RequestParam String query) {
        List<Client> clients = clientService.searchClients(query);
        return ResponseEntity.ok(clients);
    }
}
