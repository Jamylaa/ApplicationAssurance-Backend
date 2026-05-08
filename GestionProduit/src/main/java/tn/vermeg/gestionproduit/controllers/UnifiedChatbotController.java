package tn.vermeg.gestionproduit.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionproduit.entities.*;
import tn.vermeg.gestionproduit.services.*;
import tn.vermeg.gestionproduit.services.UnifiedChatbotService.ChatbotResponse;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/chatbot")
public class UnifiedChatbotController {

    private static final Logger logger = Logger.getLogger(UnifiedChatbotController.class.getName());

    private final UnifiedChatbotService chatbotService;
    private final GarantieService garantieService;
    private final PackService packService;
    private final ProduitService produitService;
    private final PackConfigurationService packConfigurationService;

    public UnifiedChatbotController(UnifiedChatbotService chatbotService,
                                   GarantieService garantieService,
                                   PackService packService,
                                   ProduitService produitService,
                                   PackConfigurationService packConfigurationService) {
        this.chatbotService = chatbotService;
        this.garantieService = garantieService;
        this.packService = packService;
        this.produitService = produitService;
        this.packConfigurationService = packConfigurationService;
    }

    @PostMapping("/process")
    public ResponseEntity<?> processPrompt(@RequestBody Map<String, String> request) {
        try {
            String prompt = request.get("prompt");
            if (prompt == null || prompt.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Prompt requis",
                    "message", "Veuillez fournir un prompt à traiter"
                ));
            }

            logger.info("Traitement du prompt: " + prompt);

            // Analyser le prompt et générer l'action
            String jsonResponse = chatbotService.processUserPrompt(prompt);
            ChatbotResponse response = parseChatbotResponse(jsonResponse);

            // Exécuter l'action correspondante
            Object result = executeAction(response);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "action", response.getAction(),
                "result", result,
                "prompt", prompt
            ));

        } catch (Exception e) {
            logger.severe("Erreur traitement prompt: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Erreur traitement",
                "details", e.getMessage()
            ));
        }
    }

    @PostMapping("/analyze-only")
    public ResponseEntity<?> analyzeOnly(@RequestBody Map<String, String> request) {
        try {
            String prompt = request.get("prompt");
            if (prompt == null || prompt.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Prompt requis");
            }

            logger.info("Analyse seule du prompt: " + prompt);

            String jsonResponse = chatbotService.processUserPrompt(prompt);
            
            return ResponseEntity.ok(Map.of(
                "prompt", prompt,
                "analysis", jsonResponse,
                "timestamp", System.currentTimeMillis()
            ));

        } catch (Exception e) {
            logger.severe("Erreur analyse prompt: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Erreur analyse",
                "details", e.getMessage()
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "Unified Chatbot Service",
            "version", "1.0.0",
            "capabilities", Map.of(
                "create_garantie", true,
                "create_pack", true,
                "create_produit", true,
                "configure_pack", true,
                "nlp_processing", true
            ),
            "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/examples")
    public ResponseEntity<?> getExamples() {
        return ResponseEntity.ok(Map.of(
            "examples", Map.of(
                "garantie", Map.of(
                    "prompt", "Créer une garantie hospitalisation premium avec 90% de remboursement sur frais réels, plafond annuel 50000€",
                    "action", "CREATE_GARANTIE"
                ),
                "pack", Map.of(
                    "prompt", "Créer un pack santé premium pour familles avec âge minimum 18, maximum 65, prix 150€ par mois",
                    "action", "CREATE_PACK"
                ),
                "produit", Map.of(
                    "prompt", "Créer un produit d'assurance santé",
                    "action", "CREATE_PRODUIT"
                ),
                "configuration", Map.of(
                    "prompt", "Ajouter la garantie dentaire au pack ID123 avec 70% de remboursement et plafond 2000€",
                    "action", "CONFIGURE_PACK"
                )
            )
        ));
    }

    private Object executeAction(ChatbotResponse response) {
        switch (response.getAction()) {
            case "CREATE_GARANTIE":
                return executeCreateGarantie(response.getData());
            case "CREATE_PACK":
                return executeCreatePack(response.getData());
            case "CREATE_PACK_WITH_GARANTIES":
                return executeCreatePackWithGaranties(response.getData());
            case "CREATE_PRODUIT":
                return executeCreateProduit(response.getData());
            case "CONFIGURE_PACK":
                return executeConfigurePack(response.getData());
            default:
                return Map.of("error", "Action non reconnue: " + response.getAction());
        }
    }

    private Object executeCreateGarantie(Object data) {
        try {
            // Vérifier si c'est la nouvelle structure imbriquée
            if (data instanceof Map) {
                Map<String, Object> responseMap = (Map<String, Object>) data;
                
                if (responseMap.containsKey("data") && responseMap.get("data") instanceof Map) {
                    // Nouvelle structure imbriquée : {"type": "garantie", "data": {...}}
                    Map<String, Object> garantieData = (Map<String, Object>) responseMap.get("data");
                    return createGarantieFromStructuredData(garantieData);
                } else {
                    // Ancienne structure plate (compatibilité)
                    Map<String, Object> garantieData = (Map<String, Object>) data;
                    return createGarantieFromFlatData(garantieData);
                }
            }
            
            return Map.of("error", "Format de données invalide");

        } catch (Exception e) {
            logger.severe("Erreur création garantie: " + e.getMessage());
            return Map.of(
                "success", false,
                "error", "Erreur création garantie",
                "details", e.getMessage()
            );
        }
    }

    private Object createGarantieFromStructuredData(Map<String, Object> garantieData) {
        Garantie garantie = new Garantie();

        // Champs principaux
        garantie.setNomGarantie((String) garantieData.get("nomGarantie"));
        garantie.setTypeGarantie(TypeGarantie.valueOf((String) garantieData.get("typeGarantie")));
        garantie.setStatut(Statut.valueOf((String) garantieData.get("statut")));
        garantie.setCoutMoyenParSinistre(((Number) garantieData.get("coutMoyenParSinistre")).doubleValue());
        garantie.setCreePar((String) garantieData.getOrDefault("creePar", "AI-Chatbot"));

        // Extraire des objets imbriqués
        Map<String, Object> couverture = (Map<String, Object>) garantieData.get("couverture");
        Map<String, Object> plafonds = (Map<String, Object>) garantieData.get("plafonds");
        Map<String, Object> conditions = (Map<String, Object>) garantieData.get("conditions");

        // Données de couverture
        if (couverture != null) {
            garantie.setTauxRemboursement(((Number) couverture.get("tauxRemboursement")).doubleValue());
            garantie.setTypeMontant(TypeMontant.valueOf((String) couverture.get("typeMontant")));
            garantie.setFranchise(((Number) couverture.get("franchise")).doubleValue());
        }

        // Données de plafonds
        if (plafonds != null) {
            garantie.setPlafondAnnuel(((Number) plafonds.get("annuel")).doubleValue());
            garantie.setPlafondMensuel(((Number) plafonds.get("mensuel")).doubleValue());
            garantie.setPlafondParActe(((Number) plafonds.get("parActe")).doubleValue());
        }

        // Données de conditions
        if (conditions != null) {
            garantie.setDureeMinContrat((Integer) conditions.get("dureeMinContrat"));
            garantie.setDureeMaxContrat((Integer) conditions.get("dureeMaxContrat"));
            garantie.setResiliableAnnuellement((Boolean) conditions.get("resiliableAnnuellement"));
        }

        Garantie created = garantieService.createGarantie(garantie);
        
        return Map.of(
            "success", true,
            "entity", created,
            "message", "Garantie créée avec succès (structure imbriquée)",
            "id", created.getIdGarantie()
        );
    }

    private Object createGarantieFromFlatData(Map<String, Object> garantieData) {
        Garantie garantie = new Garantie();

        garantie.setNomGarantie((String) garantieData.get("nomGarantie"));
        garantie.setTypeGarantie(TypeGarantie.valueOf((String) garantieData.get("typeGarantie")));
        garantie.setStatut(Statut.valueOf((String) garantieData.get("statut")));
        garantie.setTauxRemboursement(((Number) garantieData.get("tauxRemboursement")).doubleValue());
        garantie.setTypeMontant(TypeMontant.valueOf((String) garantieData.get("typeMontant")));
        garantie.setPlafondAnnuel(((Number) garantieData.get("plafondAnnuel")).doubleValue());
        garantie.setPlafondMensuel(((Number) garantieData.get("plafondMensuel")).doubleValue());
        garantie.setPlafondParActe(((Number) garantieData.get("plafondParActe")).doubleValue());
        garantie.setFranchise(((Number) garantieData.get("franchise")).doubleValue());
        garantie.setCoutMoyenParSinistre(((Number) garantieData.get("coutMoyenParSinistre")).doubleValue());
        garantie.setDureeMinContrat(((Number) garantieData.get("dureeMinContrat")).intValue());
        garantie.setDureeMaxContrat(((Number) garantieData.get("dureeMaxContrat")).intValue());
        garantie.setResiliableAnnuellement((Boolean) garantieData.get("resiliableAnnuellement"));
        garantie.setCreePar((String) garantieData.getOrDefault("creePar", "AI-Chatbot"));

        Garantie created = garantieService.createGarantie(garantie);
        
        return Map.of(
            "success", true,
            "entity", created,
            "message", "Garantie créée avec succès (structure plate)",
            "id", created.getIdGarantie()
        );
    }

    private Object executeCreatePack(Object data) {
        try {
            Map<String, Object> packData = (Map<String, Object>) data;
            Pack pack = new Pack();

            pack.setNomPack((String) packData.get("nomPack"));
            pack.setDescription((String) packData.get("description"));
            
            Number ageMin = (Number) packData.get("ageMinimum");
            if (ageMin != null) pack.setAgeMinimum(ageMin.intValue());
            
            Number ageMax = (Number) packData.get("ageMaximum");
            if (ageMax != null) pack.setAgeMaximum(ageMax.intValue());

            // Type clients
            java.util.List<String> typeClientsList = (java.util.List<String>) packData.get("typeClients");
            java.util.List<TypeClient> typeClients = typeClientsList.stream()
                .map(TypeClient::valueOf)
                .collect(java.util.stream.Collectors.toList());
            pack.setTypeClients(typeClients);

            pack.setAncienneteContratMois(((Number) packData.get("ancienneteContratMois")).intValue());
            pack.setCouvertureGeographique(CouvertureGeographique.valueOf((String) packData.get("couvertureGeographique")));
            pack.setPrixMensuel(((Number) packData.get("prixMensuel")).doubleValue());
            pack.setDureeMinContrat(((Number) packData.get("dureeMinContrat")).intValue());
            pack.setDureeMaxContrat(((Number) packData.get("dureeMaxContrat")).intValue());
            pack.setNiveauCouverture(NiveauCouverture.valueOf((String) packData.get("niveauCouverture")));
            pack.setStatut(Statut.valueOf((String) packData.get("statut")));

            Pack created = packService.createPack(pack);
            
            return Map.of(
                "success", true,
                "entity", created,
                "message", "Pack créé avec succès",
                "id", created.getIdPack()
            );

        } catch (Exception e) {
            logger.severe("Erreur création pack: " + e.getMessage());
            return Map.of(
                "success", false,
                "error", "Erreur création pack",
                "details", e.getMessage()
            );
        }
    }

    private Object executeCreateProduit(Object data) {
        try {
            Map<String, Object> produitData = (Map<String, Object>) data;
            Produit produit = new Produit();

            produit.setNomProduit((String) produitData.get("nomProduit"));
            produit.setDescription((String) produitData.get("description"));
            produit.setTypeProduit(TypeProduit.valueOf((String) produitData.get("typeProduit")));
            produit.setStatut(Statut.valueOf((String) produitData.get("statut")));

            Produit created = produitService.createProduit(produit);
            
            return Map.of(
                "success", true,
                "entity", created,
                "message", "Produit créé avec succès",
                "id", created.getIdProduit()
            );

        } catch (Exception e) {
            logger.severe("Erreur création produit: " + e.getMessage());
            return Map.of(
                "success", false,
                "error", "Erreur création produit",
                "details", e.getMessage()
            );
        }
    }

    private Object executeCreatePackWithGaranties(Object data) {
        try {
            Map<String, Object> packData = (Map<String, Object>) data;
            
            // Créer le pack
            Pack pack = new Pack();
            pack.setNomPack((String) packData.get("nomPack"));
            pack.setDescription((String) packData.get("description"));
            
            Number ageMin = (Number) packData.get("ageMinimum");
            if (ageMin != null) pack.setAgeMinimum(ageMin.intValue());
            
            Number ageMax = (Number) packData.get("ageMaximum");
            if (ageMax != null) pack.setAgeMaximum(ageMax.intValue());

            // Type clients
            java.util.List<String> typeClientsList = (java.util.List<String>) packData.get("typeClients");
            java.util.List<TypeClient> typeClients = typeClientsList.stream()
                .map(TypeClient::valueOf)
                .collect(java.util.stream.Collectors.toList());
            pack.setTypeClients(typeClients);

            pack.setAncienneteContratMois(((Number) packData.get("ancienneteContratMois")).intValue());
            pack.setCouvertureGeographique(CouvertureGeographique.valueOf((String) packData.get("couvertureGeographique")));
            pack.setPrixMensuel(((Number) packData.get("prixMensuel")).doubleValue());
            pack.setDureeMinContrat(((Number) packData.get("dureeMinContrat")).intValue());
            pack.setDureeMaxContrat(((Number) packData.get("dureeMaxContrat")).intValue());
            pack.setNiveauCouverture(NiveauCouverture.valueOf((String) packData.get("niveauCouverture")));
            pack.setStatut(Statut.valueOf((String) packData.get("statut")));

            // Créer le pack
            Pack createdPack = packService.createPack(pack);
            
            // Créer les garanties et les associer au pack
            List<Map<String, Object>> createdGaranties = new ArrayList<>();
            java.util.List<Map<String, Object>> garantiesData = (java.util.List<Map<String, Object>>) packData.get("garanties");
            
            for (Map<String, Object> garantieData : garantiesData) {
                // Créer la garantie
                Garantie garantie = new Garantie();
                garantie.setNomGarantie((String) garantieData.get("nomGarantie"));
                garantie.setTypeGarantie(TypeGarantie.valueOf((String) garantieData.get("typeGarantie")));
                garantie.setTauxRemboursement(((Number) garantieData.get("tauxRemboursement")).doubleValue());
                garantie.setStatut(Statut.ACTIF);
                garantie.setCreePar("AI-Chatbot");
                
                // Valeurs par défaut pour les champs manquants
                garantie.setTypeMontant(TypeMontant.FRAIS_REELS);
                garantie.setPlafondAnnuel(getDefaultPlafond(garantie.getTypeGarantie().toString()));
                garantie.setPlafondMensuel(garantie.getPlafondAnnuel() / 12);
                garantie.setPlafondParActe(garantie.getPlafondMensuel() / 2);
                garantie.setFranchise(0.0);
                garantie.setCoutMoyenParSinistre(garantie.getPlafondAnnuel() * 0.05);
                garantie.setDureeMinContrat(12);
                garantie.setDureeMaxContrat(60);
                garantie.setResiliableAnnuellement(true);
                
                Garantie createdGarantie = garantieService.createGarantie(garantie);
                
                // Associer la garantie au pack
                PackGarantie packGarantie = new PackGarantie();
                packGarantie.setTauxRemboursement(garantie.getTauxRemboursement());
                packGarantie.setPlafond(garantie.getPlafondAnnuel());
                packGarantie.setFranchise(garantie.getFranchise());
                packGarantie.setOptionnelle((Boolean) garantieData.get("optionnelle"));
                packGarantie.setSupplementPrix(0.0);
                packGarantie.setDelaiCarence(0);
                packGarantie.setPriorite(((Number) garantieData.get("priorite")).intValue());
                
                PackGarantie createdPackGarantie = packConfigurationService.ajouterGarantieAuPack(
                    createdPack.getIdPack(), 
                    createdGarantie.getIdGarantie(), 
                    packGarantie
                );
                
                createdGaranties.add(Map.of(
                    "garantie", createdGarantie,
                    "packGarantie", createdPackGarantie
                ));
            }
            
            return Map.of(
                "success", true,
                "pack", createdPack,
                "garanties", createdGaranties,
                "message", "Pack créé avec succès avec " + createdGaranties.size() + " garantie(s)",
                "packId", createdPack.getIdPack(),
                "totalGaranties", createdGaranties.size()
            );

        } catch (Exception e) {
            logger.severe("Erreur création pack avec garanties: " + e.getMessage());
            return Map.of(
                "success", false,
                "error", "Erreur création pack avec garanties",
                "details", e.getMessage()
            );
        }
    }

    private Object executeConfigurePack(Object data) {
        try {
            Map<String, Object> configData = (Map<String, Object>) data;
            String packId = (String) configData.get("packId");
            String garantieId = (String) configData.get("garantieId");
            
            PackGarantie packGarantie = new PackGarantie();
            packGarantie.setTauxRemboursement(((Number) configData.get("tauxRemboursement")).doubleValue());
            packGarantie.setPlafond(((Number) configData.get("plafond")).doubleValue());
            packGarantie.setFranchise(((Number) configData.get("franchise")).doubleValue());
            packGarantie.setOptionnelle((Boolean) configData.get("optionnelle"));
            packGarantie.setSupplementPrix(((Number) configData.get("supplementPrix")).doubleValue());
            packGarantie.setDelaiCarence(((Number) configData.get("delaiCarence")).intValue());
            packGarantie.setPriorite(((Number) configData.get("priorite")).intValue());

            PackGarantie created = packConfigurationService.ajouterGarantieAuPack(packId, garantieId, packGarantie);
            
            return Map.of(
                "success", true,
                "entity", created,
                "message", "Pack configuré avec succès",
                "id", created.getIdPackGarantie()
            );

        } catch (Exception e) {
            logger.severe("Erreur configuration pack: " + e.getMessage());
            return Map.of(
                "success", false,
                "error", "Erreur configuration pack",
                "details", e.getMessage()
            );
        }
    }
    
    private Double getDefaultPlafond(String typeGarantie) {
        switch (typeGarantie) {
            case "HOSPITALISATION": return 50000.0;
            case "DENTAIRE": return 2000.0;
            case "OPTIQUE": return 800.0;
            case "CONSULTATION": return 1500.0;
            default: return 10000.0;
        }
    }

    private ChatbotResponse parseChatbotResponse(String jsonResponse) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(jsonResponse, ChatbotResponse.class);
        } catch (Exception e) {
            logger.warning("Erreur parsing réponse chatbot: " + e.getMessage());
            return new ChatbotResponse("ERROR", Map.of("error", "Parsing failed", "response", jsonResponse));
        }
    }
}
