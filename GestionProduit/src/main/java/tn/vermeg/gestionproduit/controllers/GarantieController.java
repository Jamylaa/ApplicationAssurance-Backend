package tn.vermeg.gestionproduit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionproduit.entities.Garantie;
import tn.vermeg.gestionproduit.entities.Statut;
import tn.vermeg.gestionproduit.entities.TypeGarantie;
import tn.vermeg.gestionproduit.services.GarantieService;

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
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/type/{typeGarantie}")
    public ResponseEntity<List<Garantie>> getGarantiesByType(
            @PathVariable TypeGarantie typeGarantie) {
        return ResponseEntity.ok(garantieService.getGarantiesByType(typeGarantie));
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
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/plafond-min/{plafondMin}")
    public ResponseEntity<List<Garantie>> getGarantiesByPlafondMin(
            @PathVariable double plafondMin) {
        try {
            return ResponseEntity.ok(
                    garantieService.getGarantiesByPlafondMin(plafondMin));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    // CREATE

    @PostMapping
    public ResponseEntity<Garantie> createGarantie(@RequestBody Garantie garantie) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(garantieService.createGarantie(garantie));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // UPDATE

    @PutMapping("/{idGarantie}")
    public ResponseEntity<Garantie> updateGarantie(
            @PathVariable String idGarantie,
            @RequestBody Garantie garantieDetails) {
        try {
            return ResponseEntity.ok(
                    garantieService.updateGarantie(idGarantie, garantieDetails));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{idGarantie}/desactiver")
    public ResponseEntity<Garantie> desactiverGarantie(@PathVariable String idGarantie) {
        try {
            return ResponseEntity.ok(garantieService.desactiverGarantie(idGarantie));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE

    @DeleteMapping("/{idGarantie}")
    public ResponseEntity<Void> deleteGarantie(@PathVariable String idGarantie) {
        try {
            garantieService.deleteGarantie(idGarantie);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}