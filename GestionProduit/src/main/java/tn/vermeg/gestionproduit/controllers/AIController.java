package tn.vermeg.gestionproduit.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionproduit.entities.*;
import tn.vermeg.gestionproduit.services.*;

import java.util.Map;
import java.util.HashMap;
import java.util.logging.Logger;

@RestController
@RequestMapping("/ai")
public class AIController {

    private static final Logger logger = Logger.getLogger(AIController.class.getName());

    private final GarantieService garantieService;
    private final ProduitService produitService;
    private final PackService packService;

    public AIController(GarantieService garantieService, 
                      ProduitService produitService,
                      PackService packService) {
        this.garantieService = garantieService;
        this.produitService = produitService;
        this.packService = packService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createEntity(@RequestParam String message) {
        try {
            logger.info("Création entité pour message: " + message);
            
            String lowerMessage = message.toLowerCase();
            
            // Analyse du message pour créer la bonne entité
            if (lowerMessage.contains("garantie")) {
                Garantie garantie = createGarantieFromMessage(message);
                Garantie created = garantieService.createGarantie(garantie);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "type", "garantie",
                    "entity", created,
                    "message", "Garantie créée avec succès"
                ));
            }
            else if (lowerMessage.contains("produit")) {
                Produit produit = createProduitFromMessage(message);
                Produit created = produitService.createProduit(produit);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "type", "produit",
                    "entity", created,
                    "message", "Produit créé avec succès"
                ));
            }
            else if (lowerMessage.contains("pack")) {
                Pack pack = createPackFromMessage(message);
                Pack created = packService.createPack(pack);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "type", "pack",
                    "entity", created,
                    "message", "Pack créé avec succès"
                ));
            }
            else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Type d'entité non reconnu",
                    "message", "Veuillez spécifier 'garantie', 'produit' ou 'pack'"
                ));
            }

        } catch (Exception e) {
            logger.severe("Erreur création entité: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Erreur création entité",
                "details", e.getMessage()
            ));
        }
    }

    private Garantie createGarantieFromMessage(String message) {
        String lowerMessage = message.toLowerCase();
        Garantie garantie = new Garantie();
        
        // Hospitalisation Premium - 90%
        if (lowerMessage.contains("hospitalisation premium") && lowerMessage.contains("90%")) {
            garantie.setNomGarantie("Garantie Hospitalisation Premium");
            garantie.setTypeGarantie(TypeGarantie.HOSPITALISATION);
            garantie.setTauxRemboursement(0.9);
            garantie.setTypeMontant(TypeMontant.FRAIS_REELS);
            garantie.setTypePlafond(TypePlafond.ANNUEL);
            garantie.setPlafondAnnuel(50000.0);
            garantie.setPlafondMensuel(10000.0);
            garantie.setPlafondParActe(5000.0);
            garantie.setFranchise(100.0);
            garantie.setCoutMoyenParSinistre(2000.0);
            garantie.setDureeMinContrat(12);
            garantie.setDureeMaxContrat(60);
            garantie.setResiliableAnnuellement(true);
        }
        // Dentaire - 70%
        else if (lowerMessage.contains("dentaire") && lowerMessage.contains("70%")) {
            garantie.setNomGarantie("Garantie Dentaire");
            garantie.setTypeGarantie(TypeGarantie.DENTAIRE);
            garantie.setTauxRemboursement(0.7);
            garantie.setTypeMontant(TypeMontant.TARIF_CONVENTIONNE);
            garantie.setTypePlafond(TypePlafond.ANNUEL);
            garantie.setPlafondAnnuel(2000.0);
            garantie.setPlafondMensuel(300.0);
            garantie.setPlafondParActe(150.0);
            garantie.setFranchise(20.0);
            garantie.setCoutMoyenParSinistre(120.0);
            garantie.setDureeMinContrat(6);
            garantie.setDureeMaxContrat(36);
            garantie.setResiliableAnnuellement(true);
        }
        // Optique - 60%
        else if (lowerMessage.contains("optique") && lowerMessage.contains("60%")) {
            garantie.setNomGarantie("Garantie Optique");
            garantie.setTypeGarantie(TypeGarantie.OPTIQUE);
            garantie.setTauxRemboursement(0.6);
            garantie.setTypeMontant(TypeMontant.FORFAIT);
            garantie.setTypePlafond(TypePlafond.PAR_ACTE);
            garantie.setPlafondAnnuel(800.0);
            garantie.setPlafondMensuel(200.0);
            garantie.setPlafondParActe(400.0);
            garantie.setFranchise(0.0);
            garantie.setCoutMoyenParSinistre(250.0);
            garantie.setDureeMinContrat(12);
            garantie.setDureeMaxContrat(48);
            garantie.setResiliableAnnuellement(true);
        }
        // Consultation - 80%
        else if (lowerMessage.contains("consultation") && lowerMessage.contains("80%")) {
            garantie.setNomGarantie("Garantie Consultation");
            garantie.setTypeGarantie(TypeGarantie.CONSULTATION);
            garantie.setTauxRemboursement(0.8);
            garantie.setTypeMontant(TypeMontant.TARIF_CONVENTIONNE);
            garantie.setTypePlafond(TypePlafond.ANNUEL);
            garantie.setPlafondAnnuel(1500.0);
            garantie.setPlafondMensuel(150.0);
            garantie.setPlafondParActe(50.0);
            garantie.setFranchise(10.0);
            garantie.setCoutMoyenParSinistre(40.0);
            garantie.setDureeMinContrat(3);
            garantie.setDureeMaxContrat(24);
            garantie.setResiliableAnnuellement(true);
        }
        // Hospitalisation Économique - 50%
        else if (lowerMessage.contains("hospitalisation économique") && lowerMessage.contains("50%")) {
            garantie.setNomGarantie("Garantie Hospitalisation Économique");
            garantie.setTypeGarantie(TypeGarantie.HOSPITALISATION);
            garantie.setTauxRemboursement(0.5);
            garantie.setTypeMontant(TypeMontant.FRAIS_REELS);
            garantie.setTypePlafond(TypePlafond.GLOBAL);
            garantie.setPlafondAnnuel(20000.0);
            garantie.setPlafondMensuel(5000.0);
            garantie.setPlafondParActe(2000.0);
            garantie.setFranchise(300.0);
            garantie.setCoutMoyenParSinistre(1500.0);
            garantie.setDureeMinContrat(12);
            garantie.setDureeMaxContrat(36);
            garantie.setResiliableAnnuellement(false);
        }
        // Garantie par défaut
        else {
            garantie.setNomGarantie("Garantie Standard");
            garantie.setTypeGarantie(TypeGarantie.HOSPITALISATION);
            garantie.setTauxRemboursement(0.8);
            garantie.setTypeMontant(TypeMontant.FRAIS_REELS);
            garantie.setTypePlafond(TypePlafond.ANNUEL);
            garantie.setPlafondAnnuel(10000.0);
            garantie.setPlafondMensuel(500.0);
            garantie.setFranchise(50.0);
            garantie.setDureeMinContrat(12);
            garantie.setDureeMaxContrat(60);
            garantie.setResiliableAnnuellement(true);
        }
        
        garantie.setStatut(Statut.ACTIF);
        garantie.setCreePar("AI-Final-Controller");
        
        return garantie;
    }

    private Produit createProduitFromMessage(String message) {
        Produit produit = new Produit();
        produit.setNomProduit("Produit " + System.currentTimeMillis());
        produit.setTypeProduit(TypeProduit.SANTE);
        produit.setDescription("Produit créé automatiquement par AI Final Controller");
        produit.setStatut(Statut.ACTIF);
        return produit;
    }

    private Pack createPackFromMessage(String message) {
        Pack pack = new Pack();
        pack.setNomPack("Pack " + System.currentTimeMillis());
        pack.setDescription("Pack créé automatiquement par AI Final Controller");
        pack.setAgeMinimum(18);
        pack.setAgeMaximum(65);
        pack.setPrixMensuel(100.0);
        pack.setDureeMinContrat(12);
        pack.setDureeMaxContrat(36);
        pack.setNiveauCouverture(NiveauCouverture.PREMIUM);
        pack.setStatut(Statut.ACTIF);
        return pack;
    }

    @GetMapping("/create")
    public ResponseEntity<?> createEntityGet(@RequestParam String message) {
        try {
            logger.info("Création entité (GET) pour message: " + message);
            
            String lowerMessage = message.toLowerCase();
            
            // Analyse du message pour créer la bonne entité
            if (lowerMessage.contains("garantie")) {
                Garantie garantie = createGarantieFromMessage(message);
                Garantie created = garantieService.createGarantie(garantie);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "type", "garantie",
                    "entity", created,
                    "message", "Garantie créée avec succès"
                ));
            }
            else if (lowerMessage.contains("produit")) {
                Produit produit = createProduitFromMessage(message);
                Produit created = produitService.createProduit(produit);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "type", "produit",
                    "entity", created,
                    "message", "Produit créé avec succès"
                ));
            }
            else if (lowerMessage.contains("pack")) {
                Pack pack = createPackFromMessage(message);
                Pack created = packService.createPack(pack);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "type", "pack",
                    "entity", created,
                    "message", "Pack créé avec succès"
                ));
            }
            else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Type d'entité non reconnu",
                    "message", "Veuillez spécifier 'garantie', 'produit' ou 'pack'"
                ));
            }

        } catch (Exception e) {
            logger.severe("Erreur création entité: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Erreur création entité",
                "details", e.getMessage()
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "controller", "AI Final Controller",
            "timestamp", System.currentTimeMillis(),
            "description", "Contrôleur AI principal avec analyse intelligente des messages"
        ));
    }
}
