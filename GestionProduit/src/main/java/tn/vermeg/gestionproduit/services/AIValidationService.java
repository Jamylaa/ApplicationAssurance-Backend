package tn.vermeg.gestionproduit.services;

import org.springframework.stereotype.Service;
import tn.vermeg.gestionproduit.DTO.AIResponse;
import tn.vermeg.gestionproduit.DTO.AIValidationResponse;
import tn.vermeg.gestionproduit.entities.*;

import java.util.*;
import java.util.logging.Logger;

@Service
public class AIValidationService {

    private static final Logger logger = Logger.getLogger(AIValidationService.class.getName());

    public AIValidationResponse validateAIResponse(AIResponse aiResponse) {
        logger.info("Validation réponse AI pour type: " + aiResponse.getType());

        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // Validation type
        if (aiResponse.getType() == null || aiResponse.getType().trim().isEmpty()) {
            errors.add("Type requis");
            return AIValidationResponse.error(errors);
        }

        String type = aiResponse.getType().toLowerCase();
        if (!Arrays.asList("garantie", "produit", "pack").contains(type)) {
            errors.add("Type invalide: " + aiResponse.getType() + ". Types supportés: garantie, produit, pack");
            return AIValidationResponse.error(errors);
        }

        // Validation data
        if (aiResponse.getData() == null) {
            errors.add("Data requis");
            return AIValidationResponse.error(errors);
        }

        Map<String, Object> data = aiResponse.getData();

        // Validation spécifique par type
        switch (type) {
            case "garantie":
                return validateGarantie(data, warnings);
            case "produit":
                return validateProduit(data, warnings);
            case "pack":
                return validatePack(data, warnings);
            default:
                errors.add("Type non supporté: " + type);
                return AIValidationResponse.error(errors);
        }
    }

    private AIValidationResponse validateGarantie(Map<String, Object> data, List<String> warnings) {
        List<String> errors = new ArrayList<>();

        // Champs obligatoires
        if (!data.containsKey("nomGarantie") || data.get("nomGarantie") == null) {
            errors.add("nomGarantie requis");
        }

        if (!data.containsKey("typeGarantie") || data.get("typeGarantie") == null) {
            errors.add("typeGarantie requis");
        } else {
            try {
                TypeGarantie.valueOf((String) data.get("typeGarantie"));
            } catch (IllegalArgumentException e) {
                errors.add("typeGarantie invalide. Valeurs valides: " + Arrays.toString(TypeGarantie.values()));
            }
        }

        // Validation taux remboursement
        if (data.containsKey("tauxRemboursement")) {
            try {
                double taux = ((Number) data.get("tauxRemboursement")).doubleValue();
                if (taux < 0 || taux > 1) {
                    warnings.add("tauxRemboursement devrait être entre 0 et 1");
                }
            } catch (Exception e) {
                warnings.add("tauxRemboursement invalide, sera ignoré");
            }
        }

        // Validation champs financiers
        validateFinancialFields(data, warnings);

        if (!errors.isEmpty()) {
            return AIValidationResponse.error(errors);
        }

        if (!warnings.isEmpty()) {
            return AIValidationResponse.warning("garantie", data, warnings);
        }

        return AIValidationResponse.success("garantie", data);
    }

    private AIValidationResponse validateProduit(Map<String, Object> data, List<String> warnings) {
        List<String> errors = new ArrayList<>();

        // Champs obligatoires
        if (!data.containsKey("nomProduit") || data.get("nomProduit") == null) {
            errors.add("nomProduit requis");
        }

        if (!data.containsKey("typeProduit") || data.get("typeProduit") == null) {
            errors.add("typeProduit requis");
        } else {
            try {
                TypeProduit.valueOf((String) data.get("typeProduit"));
            } catch (IllegalArgumentException e) {
                errors.add("typeProduit invalide. Valeurs valides: " + Arrays.toString(TypeProduit.values()));
            }
        }

        if (!errors.isEmpty()) {
            return AIValidationResponse.error(errors);
        }

        if (!warnings.isEmpty()) {
            return AIValidationResponse.warning("produit", data, warnings);
        }

        return AIValidationResponse.success("produit", data);
    }

    private AIValidationResponse validatePack(Map<String, Object> data, List<String> warnings) {
        List<String> errors = new ArrayList<>();

        // Champs obligatoires
        if (!data.containsKey("nomPack") || data.get("nomPack") == null) {
            errors.add("nomPack requis");
        }

        if (!data.containsKey("typeProduit") || data.get("typeProduit") == null) {
            errors.add("typeProduit requis");
        } else {
            try {
                TypeProduit.valueOf((String) data.get("typeProduit"));
            } catch (IllegalArgumentException e) {
                errors.add("typeProduit invalide. Valeurs valides: " + Arrays.toString(TypeProduit.values()));
            }
        }

        // Validation âges
        if (data.containsKey("ageMinimum") && data.containsKey("ageMaximum")) {
            try {
                int ageMin = ((Number) data.get("ageMinimum")).intValue();
                int ageMax = ((Number) data.get("ageMaximum")).intValue();
                
                if (ageMin >= ageMax) {
                    errors.add("ageMinimum doit être inférieur à ageMaximum");
                }
                
                if (ageMin < 0 || ageMax > 120) {
                    warnings.add("Âges inhabituels détectés");
                }
            } catch (Exception e) {
                warnings.add("Validation âges impossible, valeurs ignorées");
            }
        }

        // Validation prix
        if (data.containsKey("prixMensuel")) {
            try {
                double prix = ((Number) data.get("prixMensuel")).doubleValue();
                if (prix < 0) {
                    warnings.add("prixMensuel ne peut pas être négatif");
                }
                if (prix > 10000) {
                    warnings.add("prixMensuel très élevé");
                }
            } catch (Exception e) {
                warnings.add("prixMensuel invalide, sera ignoré");
            }
        }

        if (!errors.isEmpty()) {
            return AIValidationResponse.error(errors);
        }

        if (!warnings.isEmpty()) {
            return AIValidationResponse.warning("pack", data, warnings);
        }

        return AIValidationResponse.success("pack", data);
    }

    private void validateFinancialFields(Map<String, Object> data, List<String> warnings) {
        String[] financialFields = {"plafondAnnuel", "plafondMensuel", "plafondParActe", "franchise"};
        
        for (String field : financialFields) {
            if (data.containsKey(field)) {
                try {
                    double value = ((Number) data.get(field)).doubleValue();
                    if (value < 0) {
                        warnings.add(field + " ne peut pas être négatif");
                    }
                    if (value > 1000000) {
                        warnings.add(field + " très élevé");
                    }
                } catch (Exception e) {
                    warnings.add(field + " invalide, sera ignoré");
                }
            }
        }
    }
}
