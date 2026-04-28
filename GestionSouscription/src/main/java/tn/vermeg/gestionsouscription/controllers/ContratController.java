package tn.vermeg.gestionsouscription.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionsouscription.entities.Contrat;
import tn.vermeg.gestionsouscription.services.ContratService;

import java.util.List;
@RestController
@RequestMapping("/api/contrats")
@CrossOrigin(origins = "http://localhost:4200")
public class ContratController {

    private final ContratService contratService;
    public ContratController(ContratService contratService) {
        this.contratService = contratService;
    }

    @GetMapping
    public List<Contrat> getAllContrats() {
        return contratService.getAllContrats();
    }

    @GetMapping("/{idContrat}")
    public ResponseEntity<Contrat> getContratById(@PathVariable String idContrat) {
        return contratService.getContratById(idContrat)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());}

    @GetMapping("/client/{idClient}")
    public List<Contrat> getContratsByClientId(@PathVariable String idClient) {
        return contratService.getContratsByClientId(idClient);}

    @GetMapping("/client/email/{email}")
    public List<Contrat> getContratsByClientEmail(@PathVariable String email) {
        return contratService.getContratsByClientEmail(email);}

    @GetMapping("/produit/{idProduit}")
    public List<Contrat> getContratsByProduitId(@PathVariable String idProduit) {
        return contratService.getContratsByProduitId(idProduit);}

    @GetMapping("/statut/{statut}")
    public List<Contrat> getContratsByStatut(@PathVariable String statut) {
        return contratService.getContratsByStatut(statut);}

    @PostMapping("/renouveler/{idContrat}")
    public ResponseEntity<?> renouvelerContrat(@PathVariable String idContrat,
                                               @RequestParam int dureeMois) {
        try {
            Contrat contrat = contratService.renouvelerContrat(idContrat, dureeMois);
            return ResponseEntity.ok(contrat);} catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }}

    @PutMapping("/{idContrat}")
    public ResponseEntity<?> updateContrat(@PathVariable String idContrat, @RequestBody Contrat contrat) {
        try {
            Contrat updatedContrat = contratService.updateContrat(idContrat, contrat);
            return ResponseEntity.ok(updatedContrat);} catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());}
    }
    @PutMapping("/resilier/{idContrat}")
    public ResponseEntity<?> resilierContrat(@PathVariable String idContrat) {
        try {
            Contrat contrat = contratService.resilierContrat(idContrat);
            return ResponseEntity.ok(contrat);} catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }}

    @DeleteMapping("/{idContrat}")
    public ResponseEntity<Void> supprimerContrat(@PathVariable String idContrat) {
        contratService.supprimerContrat(idContrat);
        return ResponseEntity.noContent().build();}
}