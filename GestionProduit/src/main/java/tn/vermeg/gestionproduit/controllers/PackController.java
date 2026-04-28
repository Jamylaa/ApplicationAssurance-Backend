package tn.vermeg.gestionproduit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionproduit.entities.NiveauCouverture;
import tn.vermeg.gestionproduit.entities.Pack;
import tn.vermeg.gestionproduit.entities.Statut;
import tn.vermeg.gestionproduit.entities.TypeClient;
import tn.vermeg.gestionproduit.services.PackService;

import java.util.List;

@RestController
@RequestMapping("/api/packs")
@CrossOrigin(origins = "http://localhost:4200")
public class PackController {

    @Autowired
    private PackService packService;

    // READ
    @GetMapping
    public ResponseEntity<List<Pack>> getAllPacks() {
        return ResponseEntity.ok(packService.getAllPacks());
    }

    @GetMapping("/{idPack}")
    public ResponseEntity<Pack> getPackById(@PathVariable String idPack) {
        try {
            return ResponseEntity.ok(packService.getPackById(idPack));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/produit/{produitId}")
    public ResponseEntity<List<Pack>> getPacksByProduit(@PathVariable String produitId) {
        return ResponseEntity.ok(packService.getPacksByProduit(produitId));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Pack>> getPacksByStatut(@PathVariable Statut statut) {
        return ResponseEntity.ok(packService.getPacksByStatut(statut));
    }

    @GetMapping("/niveau/{niveauCouverture}")
    public ResponseEntity<List<Pack>> getPacksByNiveau(
            @PathVariable NiveauCouverture niveauCouverture) {
        return ResponseEntity.ok(packService.getPacksByNiveauCouverture(niveauCouverture));
    }

    @GetMapping("/type-client/{typeClient}")
    public ResponseEntity<List<Pack>> getPacksByTypeClient(
            @PathVariable TypeClient typeClient) {
        return ResponseEntity.ok(packService.getPacksByTypeClient(typeClient));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Pack>> searchPacks(@RequestParam String nomPack) {
        return ResponseEntity.ok(packService.searchPacks(nomPack));
    }

    @GetMapping("/prix-range")
    public ResponseEntity<List<Pack>> getPacksByPrixRange(
            @RequestParam double prixMin,
            @RequestParam double prixMax) {
        try {
            return ResponseEntity.ok(packService.getPacksByPrixRange(prixMin, prixMax));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // CREATE

    @PostMapping
    public ResponseEntity<Pack> createPack(@RequestBody Pack pack) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(packService.createPack(pack));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // UPDATE

    @PutMapping("/{idPack}")
    public ResponseEntity<Pack> updatePack(
            @PathVariable String idPack,
            @RequestBody Pack packDetails) {
        try {
            return ResponseEntity.ok(packService.updatePack(idPack, packDetails));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{idPack}/desactiver")
    public ResponseEntity<Pack> desactiverPack(@PathVariable String idPack) {
        try {
            return ResponseEntity.ok(packService.desactiverPack(idPack));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE

    @DeleteMapping("/{idPack}")
    public ResponseEntity<Void> deletePack(@PathVariable String idPack) {
        try {
            packService.deletePack(idPack);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}