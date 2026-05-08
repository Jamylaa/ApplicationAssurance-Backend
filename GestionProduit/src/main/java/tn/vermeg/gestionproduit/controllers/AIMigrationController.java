package tn.vermeg.gestionproduit.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionproduit.DTO.AIResponse;
import tn.vermeg.gestionproduit.DTO.AIValidationResponse;
import tn.vermeg.gestionproduit.services.*;

import java.util.Map;
import java.util.HashMap;
import java.util.logging.Logger;

@RestController
@RequestMapping("/ai/migration")
public class AIMigrationController {

    private static final Logger logger = Logger.getLogger(AIMigrationController.class.getName());

    private final AIValidationService validationService;

    public AIMigrationController(AIValidationService validationService) {
        this.validationService = validationService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getMigrationStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "AI Migration Service");
        status.put("version", "2.0.0");
        status.put("llm_configured", false);
        status.put("migration_phase", "step_2_llm_integration");
        status.put("legacy_python_service", "deprecated");
        status.put("new_java_service", "active");
        status.put("endpoints", Map.of(
            "new_ai_chat", "/ai/chat",
            "migration_status", "/ai/migration/status",
            "health_check", "/ai/migration/health"
        ));
        return ResponseEntity.ok(status);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            boolean llmHealthy = false;
            
            Map<String, Object> health = new HashMap<>();
            health.put("status", llmHealthy ? "healthy" : "unhealthy");
            health.put("llm_service", llmHealthy ? "ok" : "misconfigured");
            health.put("validation_service", "ok");
            health.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            logger.severe("Health check failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/validate-only")
    public ResponseEntity<?> validateLLMResponse(@RequestBody Map<String, String> request) {
        logger.info("Validation-only request received");
        
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Message requis");
            }

            // 1. Simulation LLM (remplacé par réponse par défaut)
            String llmRawResponse = "{\"type\":\"garantie\",\"data\":{\"nomGarantie\":\"Test Garantie\"}}";
            logger.info("Réponse LLM brute: " + llmRawResponse);

            // 2. Nettoyage JSON
            String cleanJson = cleanJson(llmRawResponse);
            logger.info("JSON nettoyé: " + cleanJson);

            // 3. Conversion en objet
            AIResponse aiResponse;
            try {
                aiResponse = new com.fasterxml.jackson.databind.ObjectMapper().readValue(cleanJson, AIResponse.class);
            } catch (Exception e) {
                logger.warning("Erreur parsing JSON: " + e.getMessage() + ", JSON: " + cleanJson);
                // Créer une réponse par défaut si le parsing échoue
                aiResponse = new AIResponse();
                aiResponse.setType("unknown");
                aiResponse.setData(Map.of("error", "parsing_failed"));
            }

            // 4. Validation robuste
            AIValidationResponse validation = validationService.validateAIResponse(aiResponse);
            
            return ResponseEntity.ok(Map.of(
                "llm_response", llmRawResponse,
                "cleaned_json", cleanJson,
                "validation", validation
            ));

        } catch (Exception e) {
            logger.severe("Erreur validation-only: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Erreur validation",
                "details", e.getMessage()
            ));
        }
    }

    @PostMapping("/compare")
    public ResponseEntity<?> compareWithLegacy(@RequestBody Map<String, String> request) {
        logger.info("Comparaison avec legacy demandée");
        
        try {
            String message = request.get("message");
            
            // Simulation LLM
            String llmResponse = "{\"type\":\"garantie\",\"data\":{\"nomGarantie\":\"Test Garantie\"}}";
            String cleanJson = cleanJson(llmResponse);
            AIResponse aiResponse = new com.fasterxml.jackson.databind.ObjectMapper().readValue(cleanJson, AIResponse.class);
            AIValidationResponse validation = validationService.validateAIResponse(aiResponse);
            
            return ResponseEntity.ok(Map.of(
                "new_approach", Map.of(
                    "llm_response", llmResponse,
                    "validation", validation,
                    "status", validation.isValid() ? "valid" : "invalid"
                ),
                "legacy_status", "deprecated",
                "recommendation", validation.isValid() ? "migrer vers nouveau système" : "corriger les erreurs de validation"
            ));
            
        } catch (Exception e) {
            logger.severe("Erreur comparaison: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Erreur comparaison",
                "details", e.getMessage()
            ));
        }
    }

    // Méthode utilitaire de nettoyage JSON
    private String cleanJson(String input) {
        if (input == null) return "";

        input = input.replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();

        int start = input.indexOf("{");
        int end = input.lastIndexOf("}");

        if (start != -1 && end != -1) {
            input = input.substring(start, end + 1);
        }

        return input;
    }
}
