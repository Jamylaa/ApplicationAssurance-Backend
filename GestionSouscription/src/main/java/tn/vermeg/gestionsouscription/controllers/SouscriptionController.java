package tn.vermeg.gestionsouscription.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionsouscription.dto.SouscriptionRequest;
import tn.vermeg.gestionsouscription.entities.Contrat;
import tn.vermeg.gestionsouscription.services.SouscriptionService;


@RestController
@RequestMapping("/api/souscription")
@CrossOrigin(origins = "http://localhost:4200")
public class SouscriptionController {

    private final SouscriptionService souscriptionService;

    public SouscriptionController(SouscriptionService souscriptionService) {
        this.souscriptionService = souscriptionService;}

    /**
     * Crée une nouvelle souscription (contrat enrichi).
     * Le service va chercher les données client et produit via Feign.
     */
    @PostMapping("/creer")
    public ResponseEntity<?> creerSouscription(@RequestBody SouscriptionRequest request) {
        try {
            Contrat contrat = souscriptionService.creerSouscription(request);
            return ResponseEntity.ok(contrat);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
