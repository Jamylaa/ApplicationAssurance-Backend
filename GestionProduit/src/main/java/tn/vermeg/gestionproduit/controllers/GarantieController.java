package tn.vermeg.gestionproduit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionproduit.entities.Garantie;
import tn.vermeg.gestionproduit.entities.Statut;
import tn.vermeg.gestionproduit.exceptions.TypeGarantieException;
import tn.vermeg.gestionproduit.services.GarantieService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/garanties")
@CrossOrigin(origins = "http://localhost:4200")
public class GarantieController {

    @Autowired
    private GarantieService garantieService;

    // READ
    @GetMapping
    public ResponseEntity<List<Garantie>> getAllGaranties() {
        return ResponseEntity.ok(garantieService.getAllGaranties());
    }

    @GetMapping("/{idGarantie}")
    public ResponseEntity<Garantie> getGarantieById(@PathVariable String idGarantie) {
        try {
            return ResponseEntity.ok(garantieService.getGarantieById(idGarantie));
        } catch (TypeGarantieException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Garantie>> getGarantiesByType(
            @PathVariable String type) {
        try {
            return ResponseEntity.ok(garantieService.getGarantiesByType(type));
        } catch (TypeGarantieException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Garantie>> getGarantiesByStatut(@PathVariable Statut statut) {
        return ResponseEntity.ok(garantieService.getGarantiesByStatut(statut));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Garantie>> searchGaranties(@RequestParam String nomGarantie) {
        return ResponseEntity.ok(garantieService.searchGaranties(nomGarantie));
    }

    @GetMapping("/taux-min/{tauxMin}")
    public ResponseEntity<List<Garantie>> getGarantiesByTauxMin(
            @PathVariable double tauxMin) {
        try {
            return ResponseEntity.ok(
                    garantieService.getGarantiesByTauxRemboursementMin(tauxMin));
        } catch (TypeGarantieException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/plafond-min/{plafondMin}")
    public ResponseEntity<List<Garantie>> getGarantiesByPlafondMin(
            @PathVariable double plafondMin) {
        try {
            return ResponseEntity.ok(
                    garantieService.getGarantiesByPlafondMin(plafondMin));
        } catch (TypeGarantieException e) {
            return ResponseEntity.badRequest().build();
        }
    }

     // Crée une nouvelle garantie avec validation robuste
    @PostMapping
    public ResponseEntity<Garantie> createGarantie(@Valid @RequestBody Garantie garantie) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(garantieService.createGarantie(garantie));
        } catch (TypeGarantieException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // UPDATE avec validation
    @PutMapping("/{idGarantie}")
    public ResponseEntity<Garantie> updateGarantie(
            @PathVariable String idGarantie,
            @Valid @RequestBody Garantie garantieDetails) {
        try {
            return ResponseEntity.ok(
                    garantieService.updateGarantie(idGarantie, garantieDetails));
        } catch (TypeGarantieException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

  //   Désactive une garantie
    @PatchMapping("/{idGarantie}/desactiver")
    public ResponseEntity<Garantie> desactiverGarantie(@PathVariable String idGarantie) {
        try {
            return ResponseEntity.ok(garantieService.desactiverGarantie(idGarantie));
        } catch (TypeGarantieException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE
    @DeleteMapping("/{idGarantie}")
    public ResponseEntity<Void> deleteGarantie(@PathVariable String idGarantie) {
        try {
            garantieService.deleteGarantie(idGarantie);
            return ResponseEntity.noContent().build();
        } catch (TypeGarantieException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}