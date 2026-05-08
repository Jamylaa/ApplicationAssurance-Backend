package tn.vermeg.gestionproduit.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionproduit.entities.Garantie;
import tn.vermeg.gestionproduit.entities.Pack;
import tn.vermeg.gestionproduit.entities.PackGarantie;
import tn.vermeg.gestionproduit.services.PackConfigurationService;

import java.util.List;

@RestController
@RequestMapping("/api/pack-configuration")
@CrossOrigin(origins = "http://localhost:4200")
public class PackConfigurationController {

    private final PackConfigurationService packConfigurationService;

    public PackConfigurationController(PackConfigurationService packConfigurationService) {
        this.packConfigurationService = packConfigurationService;
    }

    // READ

    @GetMapping("/{packId}/garanties")
    public ResponseEntity<?> getGarantiesDuPack(@PathVariable String packId) {
        try {
            return ResponseEntity.ok(packConfigurationService.getGarantiesDuPack(packId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{packId}/garanties/incluses")
    public ResponseEntity<?> getGarantiesInclusesDuPack(@PathVariable String packId) {
        try {
            return ResponseEntity.ok(packConfigurationService.getGarantiesInclusesDuPack(packId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{packId}/garanties/optionnelles")
    public ResponseEntity<?> getGarantiesOptionnellesDuPack(@PathVariable String packId) {
        try {
            return ResponseEntity.ok(packConfigurationService.getGarantiesOptionnellesDuPack(packId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{packId}/garanties-disponibles")
    public ResponseEntity<?> getGarantiesDisponiblesPourPack(@PathVariable String packId) {
        try {
            return ResponseEntity.ok(packConfigurationService.getGarantiesDisponiblesPourPack(packId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/{packId}/prix-total")
    public ResponseEntity<?> calculerPrixTotalPack(@PathVariable String packId) {
        try {
            return ResponseEntity.ok(packConfigurationService.calculerPrixTotalPack(packId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // CREATE

    @PostMapping("/{packId}/garanties/{garantieId}")
    public ResponseEntity<?> ajouterGarantieAuPack(
            @PathVariable String packId,
            @PathVariable String garantieId,
            @RequestBody PackGarantie packGarantie) {

        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(packConfigurationService.ajouterGarantieAuPack(packId, garantieId, packGarantie));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/avec-garanties-complet")
    public ResponseEntity<?> creerPackAvecGaranties(
            @RequestBody CreatePackWithGarantiesRequest request) {

        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(packConfigurationService.creerPackAvecGaranties(
                            request.getPack(), request.getGarantieIds()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // UPDATE

    @PutMapping("/{packId}/garanties/{packGarantieId}")
    public ResponseEntity<?> modifierGarantieDansPack(
            @PathVariable String packId,
            @PathVariable String packGarantieId,
            @RequestBody PackGarantie details) {

        try {
            return ResponseEntity.ok(
                    packConfigurationService.modifierGarantieDansPack(packId, packGarantieId, details));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // DELETE

    @DeleteMapping("/{packId}/garanties/{packGarantieId}")
    public ResponseEntity<Void> supprimerGarantieDuPack(
            @PathVariable String packId,
            @PathVariable String packGarantieId) {

        try {
            packConfigurationService.supprimerGarantieDuPack(packId, packGarantieId);
            return ResponseEntity.noContent().build(); // ✅ 204
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DTO

    public static class CreatePackWithGarantiesRequest {

        private Pack pack;
        private List<String> garantieIds;

        public Pack getPack() {
            return pack;
        }

        public void setPack(Pack pack) {
            this.pack = pack;
        }

        public List<String> getGarantieIds() {
            return garantieIds;
        }

        public void setGarantieIds(List<String> garantieIds) {
            this.garantieIds = garantieIds;
        }
    }
}