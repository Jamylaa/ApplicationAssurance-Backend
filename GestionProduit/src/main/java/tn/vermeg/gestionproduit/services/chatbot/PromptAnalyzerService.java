package tn.vermeg.gestionproduit.services.chatbot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
@Service
public class PromptAnalyzerService {
    private static final Logger logger = LoggerFactory.getLogger(PromptAnalyzerService.class);
    // ========== KEYWORDS AVEC PRIORISATION ==========
    // PRODUIT: Keywords spécifiques au contexte produit d'assurance
    private static final List<String> PRODUIT_KEYWORDS = Arrays.asList(
        "produit", "product", "assurance-produit", "formule principale"
    );
    // GARANTIE: Keywords spécifiques au contexte garantie/couverture
    private static final List<String> GARANTIE_KEYWORDS = Arrays.asList(
        "garantie", "warranty", "couverture", "assurance", "protection"
    );
    // PACK: Keywords spécifiques au contexte pack/offre
    private static final List<String> PACK_KEYWORDS = Arrays.asList(
        "pack", "package", "offre", "formule"
    );
    // Actions EXPLICITEES: Phrases exactes avec contexte élevé
    private static final Map<String, ChatbotAction> EXPLICIT_PHRASES = Map.ofEntries(
        // CRÉATION DE PRODUIT
        Map.entry("créer un produit", ChatbotAction.PRODUIT),
        Map.entry("create a product", ChatbotAction.PRODUIT),
        Map.entry("créer une produit", ChatbotAction.PRODUIT),
        Map.entry("nouveau produit", ChatbotAction.PRODUIT),
        Map.entry("ajouter un produit", ChatbotAction.PRODUIT),
        // CRÉATION DE GARANTIE
        Map.entry("créer une garantie", ChatbotAction.GARANTIE),
        Map.entry("create a warranty", ChatbotAction.GARANTIE),
        Map.entry("créer une couverture", ChatbotAction.GARANTIE),
        Map.entry("nouvelle garantie", ChatbotAction.GARANTIE),
        Map.entry("ajouter une garantie", ChatbotAction.GARANTIE),
        // CRÉATION DE PACK
        Map.entry("créer un pack", ChatbotAction.PACK),
        Map.entry("create a pack", ChatbotAction.PACK),
        Map.entry("nouveau pack", ChatbotAction.PACK),
        Map.entry("ajouter un pack", ChatbotAction.PACK),
        // CONFIGURATION
        Map.entry("configurer un pack", ChatbotAction.CONFIGURATION_PACK),
        Map.entry("configure a pack", ChatbotAction.CONFIGURATION_PACK),
        Map.entry("configurer le pack", ChatbotAction.CONFIGURATION_PACK)
    );
    private static final List<String> CREATION_KEYWORDS = Arrays.asList(
        "créer", "create", "ajouter", "add", "nouveau", "new", "génération", "générer"
    );
    private static final List<String> CONFIGURATION_KEYWORDS = Arrays.asList(
        "configurer", "configure", "configuration", "paramétrer", "setting", "modifier", "update"
    );
    private static final List<String> AJOUT_KEYWORDS = Arrays.asList(
        "ajout", "ajouter", "add", "intégrer", "integration"
    );
    // ========== ANALYSE D'ACTION - ULTRA ROBUSTE ==========
//Algorithme de priorisation stricte à 3 niveaux
     //GARANTIE: Priorité détection:
     // 1. "créer un produit" → PRODUIT (100% confiance)
     // 2. "créer" + (contient "produit" ET pas "garantie") → PRODUIT
     // 3. "produit" (seul) → PRODUIT
    //@param prompt Le prompt utilisateur à analyser
     // @return ChatbotAction détectée ou null si ambigu
    public ChatbotAction analyzeAction(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            logger.warn("❌ Prompt vide ou null");
            return null;
        }

        String lowerPrompt = prompt.toLowerCase();
        logger.info("🔍 ANALYSE ACTION - Prompt: {}", prompt);
        ChatbotAction explicitAction = detectExplicitPhrase(lowerPrompt);
        if (explicitAction != null) {
            logger.info("✅ Action détectée NIVEAU 1 (Phrase Explicite): {} - Confiance: 100%", explicitAction);
            return explicitAction;
        }
        //COMBINAISONS ACTION + ENTITÉ (80% CONFIANCE)
        ChatbotAction combinedAction = detectCombinedAction(lowerPrompt);
        if (combinedAction != null) {
            logger.info("✅ Action détectée NIVEAU 2 (Combina Explicite): {} - Confiance: 80%", combinedAction);
            return combinedAction;
        }
        //ENTITÉ SEULE AVEC PRIORISATION (60% CONFIANCE)
        ChatbotAction defaultAction = detectByEntity(lowerPrompt);
        if (defaultAction != null) {
            logger.info("⚠️ Action détectée NIVEAU 3 (Entité Primaire): {} - Confiance: 60%", defaultAction);
            return defaultAction;
        }
        
        logger.warn("❌ AUCUNE ACTION DÉTECTÉE pour prompt: {}", prompt);
        return null;
    }
    // Détection par phrases exactes (priorité maximale)
    private ChatbotAction detectExplicitPhrase(String lowerPrompt) {
        for (Map.Entry<String, ChatbotAction> entry : EXPLICIT_PHRASES.entrySet()) {
            if (lowerPrompt.contains(entry.getKey())) {
                logger.debug("   → Phrase trouvée: '{}' → Action: {}", entry.getKey(), entry.getValue());
                return entry.getValue();
            }
        }
        return null;
    }
    // Détection par combinaisons (action + entité avec contexte)
     //Exemple: "créer" + "produit" (sans "garantie") = PRODUIT
    private ChatbotAction detectCombinedAction(String lowerPrompt) {
        boolean hasCreation = containsAny(lowerPrompt, CREATION_KEYWORDS);
        boolean hasConfiguration = containsAny(lowerPrompt, CONFIGURATION_KEYWORDS);
        boolean hasAjout = containsAny(lowerPrompt, AJOUT_KEYWORDS);
        
        boolean hasProduitKeyword = containsAny(lowerPrompt, PRODUIT_KEYWORDS);
        boolean hasGarantieKeyword = containsAny(lowerPrompt, GARANTIE_KEYWORDS);
        boolean hasPackKeyword = containsAny(lowerPrompt, PACK_KEYWORDS);
        // RÈGLE 1: Ajout de garantie à pack
        if (hasAjout && hasGarantieKeyword && hasPackKeyword) {
            logger.debug("   → Combinaison détectée: ajout + garantie + pack");
            return ChatbotAction.AJOUT_GARANTIE_PACK;
        }
        // RÈGLE 2: Configuration de pack
        if (hasConfiguration && hasPackKeyword) {
            logger.debug("   → Combinaison détectée: configure + pack");
            return ChatbotAction.CONFIGURATION_PACK;
        }
        // RÈGLE 3: Création avec priorités strictes
        if (hasCreation) {
            // 3a: PRODUIT = création + "produit" (sans "garantie" ou "pack")
            if (hasProduitKeyword && !hasGarantieKeyword && !hasPackKeyword) {
                logger.debug("   → Combinaison détectée: création + PRODUIT (exclusive)");
                return ChatbotAction.PRODUIT;
            }
            // 3b: GARANTIE = création + "garantie" (sans "produit" ou "pack")
            if (hasGarantieKeyword && !hasProduitKeyword && !hasPackKeyword) {
                logger.debug("   → Combinaison détectée: création + GARANTIE (exclusive)");
                return ChatbotAction.GARANTIE;
            }
            // 3c: PACK = création + "pack"
            if (hasPackKeyword && !hasProduitKeyword && !hasGarantieKeyword) {
                logger.debug("   → Combinaison détectée: création + PACK (exclusive)");
                return ChatbotAction.PACK;
            }
            // 3d: Ambiguïté avec création - PRIORISATION STRICTE
            if (hasProduitKeyword) {
                logger.debug("   → Création + AMBIGUÏTÉ → Priorisation: PRODUIT");
                return ChatbotAction.PRODUIT;
            }
            if (hasPackKeyword) {
                logger.debug("   → Création + AMBIGUÏTÉ → Priorisation: PACK");
                return ChatbotAction.PACK;
            }
            if (hasGarantieKeyword) {
                logger.debug("   → Création + AMBIGUÏTÉ → Priorisation: GARANTIE");
                return ChatbotAction.GARANTIE;
            }
        }
        return null;
    }
     // Détection par entité seule (fallback) Priorisation: PRODUIT > PACK > GARANTIE

    private ChatbotAction detectByEntity(String lowerPrompt) {
        if (containsAny(lowerPrompt, PRODUIT_KEYWORDS)) {
            logger.debug("   → Entité détectée: PRODUIT");
            return ChatbotAction.PRODUIT;
        }
        if (containsAny(lowerPrompt, PACK_KEYWORDS)) {
            logger.debug("   → Entité détectée: PACK");
            return ChatbotAction.PACK;
        }
        if (containsAny(lowerPrompt, GARANTIE_KEYWORDS)) {
            logger.debug("   → Entité détectée: GARANTIE");
            return ChatbotAction.GARANTIE;
        }
        return null;
    }
    // ========== HELPERS UTILITAIRES ==========
    private boolean containsExplicitPhrase(String prompt, String... phrases) {
        for (String phrase : phrases) {
            if (prompt.contains(phrase)) return true;
        }
        return false;
    }
    private boolean containsAny(String text, List<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }
    public String extractNomGarantie(String prompt) {
        // Priorité 1: extraction explicite avec "nommée/nommé" ou "appelée"
        String explicitName = extractValueWithPattern(prompt, 
            "(?:garantie|warranty|coverage)\\s+(?:nommée?|appelée?|appelé|dénommée?)\\s+[\"']?([^\"',.;!?\\s]+)[\"']?");
        if (explicitName != null) return explicitName;
        
        // Priorité 2: extraction implicite - nom directement après "garantie"
        Pattern implicitPattern = Pattern.compile(
            "garantie\\s+([^,.!?]+?)\\s+(?:active|inactif|avec|de\\s+type|statut|résiliable|plafond|taux|franchise|coût|durée|$)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
        );
        Matcher matcher = implicitPattern.matcher(prompt);
        if (matcher.find()) return matcher.group(1).trim();
        
        // Priorité 3: extraction avec guillemets
        String quotedName = extractValueWithPattern(prompt, 
            "[\"']([^\"',.;!?\\s]+)[\"']?\\s+(?:garantie|warranty|coverage)");
        if (quotedName != null) return quotedName;
        return null;
    }
    public String extractNomProduit(String prompt) {
        return extractValueWithPattern(prompt,
            "(?:produit|product)\\s+(?:d['']\\s*\\w+\\s+)*nommé\\s+[\"']?([^\"',.;!?]+)[\"']?|"
            + "(?:produit|product)\\s+(?:nommé|appelé|dénommé|intitulé)\\s+[\"']?([^\"',.;!?]+)[\"']?|"
            + "[\"']([^\"',.;!?]+)[\"']?\\s+(?:produit|product)");
    }
    public String extractNomPack(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return null;
        }
        String[] patterns = {
            // pack … nommé … (nom non greedy jusqu'à délimiteur)
            "(?is)(?:pack|package|offre|formule)\\b.+?nomm[eé]\\s+(?:l['']|la\\s+)?[\"']?([^\"'\\n]+?)[\"']?"
                + "(?=\\s*(?:,|\\n|prix\\s+mensuel|type\\s+de\\s+client|cible\\s+clients?|description|pour\\s+un\\s+produit|pour\\s+le\\s+produit|les\\s+garanties|avec\\s+les\\s+garanties|dur[eé]e|âge|age|$))",
            // « nommé X pack » / guillemets
            "(?is)[\"']([^\"'\\n]{2,100})[\"']\\s*(?:pack|package|offre|formule)\\b",
            "(?is)(?:pack|package|offre|formule)\\s+(?:nommé|appelé|dénommé|intitulé)\\s+[\"']?([^\"',.;!?\\n]+)[\"']?",
            "(?is)[\"']([^\"',.;!?\\n]+)[\"']?\\s+(?:pack|package|offre|formule)\\b"
        };
        for (String p : patterns) {
            String v = extractValueWithPattern(prompt, p);
            if (v != null) {
                String t = v.trim();
                if (t.length() >= 2) {
                    return t;
                }
            }
        }
        return null;
    }
    public String extractDescription(String prompt) {
        Pattern pattern = Pattern.compile(
            "(?:description|détail|détails?)\\s*[:]?\\s*[\"']?([^\"',.!?;]+)[\"']?|" +
            "avec (?:la )?description\\s+[\"']?([^\"',.!?;]+)[\"']?"
        );
        Matcher matcher = pattern.matcher(prompt.toLowerCase());
        return matcher.find() ? matcher.group(1) != null ? matcher.group(1) : matcher.group(2) : null;
    }
    public String extractTypeProduit(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.contains("santé") || lowerPrompt.contains("sante")) return "SANTE";
        if (lowerPrompt.contains("auto") || lowerPrompt.contains("voiture") || lowerPrompt.contains("véhicule")) return "AUTO";
        if (lowerPrompt.contains("habitation") || lowerPrompt.contains("logement") || lowerPrompt.contains("maison")) return "HABITATION";
        if (lowerPrompt.contains("vie") || lowerPrompt.contains("décès") || lowerPrompt.contains("survie")) return "VIE";
        if (lowerPrompt.contains("prévoyance") || lowerPrompt.contains("prevoyance") || lowerPrompt.contains("prévision")) return "PREVOYANCE";
        if (lowerPrompt.contains("épargne") || lowerPrompt.contains("epargne") || lowerPrompt.contains("investissement")) return "EPARGNE";
        return null;
    }
    public String extractTypeGarantie(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.contains("hospitalisation") && lowerPrompt.contains("premium")) return "HOSPITALISATION_PREMIUM";
        if (lowerPrompt.contains("hospitalisation") || lowerPrompt.contains("hôpital")) return "HOSPITALISATION";
        if (lowerPrompt.contains("consultation") || lowerPrompt.contains("médecin") || lowerPrompt.contains("spécialiste")) return "CONSULTATION";
        if (lowerPrompt.contains("dentaire") || lowerPrompt.contains("dent") || lowerPrompt.contains("soin dentaire")) return "DENTAIRE";
        if (lowerPrompt.contains("optique") || lowerPrompt.contains("lunettes") || lowerPrompt.contains("vue") || lowerPrompt.contains("verre")) return "OPTIQUE";
        if (lowerPrompt.contains("médicament") || lowerPrompt.contains("pharmacie") || lowerPrompt.contains("médicaments")) return "MEDICAMENT";
        return "AUTRE";
    }
    public Double extractTauxRemboursement(String prompt) {
        Double result = extractDoubleWithPattern(prompt,
            "(?:taux|taux de|pourcentage)\\s+(?:de )?remboursement\\s*[:]?\\s*(\\d+(?:[.,]\\d+)?)%?|" +
            "remboursement\\s+(?:de|à)\\s*(\\d+(?:[.,]\\d+)?)%?|" +
            "(\\d+(?:[.,]\\d+)?)%?\\s*(?:de )?remboursement");
        
        if (result != null && result > 1.0) {
            result = result / 100.0;
        }
        return result != null ? result : 0.0;
    }
    public PlafondData extractPlafonds(String prompt) {
        PlafondData plafonds = new PlafondData();
        try {
            plafonds.annuel = extractDoubleWithPattern(prompt,
                "plafond\\s+annuel\\s+de\\s+(\\d+(?:[.,]\\d+)?)|" +
                "(?:plafond|limite)\\s+(?:annuel|annuelle)\\s*[:]?\\s*(\\d+(?:[\\s\\d.,]*)?)|" +
                "(\\d+(?:[.,]\\d+)?)\\s*(?:€|euros?)?\\s*(?:par )?an");
            if (plafonds.annuel == null) plafonds.annuel = 0.0;
            
            plafonds.mensuel = extractDoubleWithPattern(prompt,
                "plafond\\s+mensuel\\s+de\\s+(\\d+(?:[.,]\\d+)?)|" +
                "(?:plafond|limite)\\s+(?:mensuel|mensuelle)\\s*[:]?\\s*(\\d+(?:[\\s\\d.,]*)?)|" +
                "(\\d+(?:[.,]\\d+)?)\\s*(?:€|euros?)?\\s*(?:par )?mois");
            if (plafonds.mensuel == null) plafonds.mensuel = 0.0;
            
            plafonds.parActe = extractDoubleWithPattern(prompt,
                "plafond\\s+par\\s+acte\\s+de\\s+(\\d+(?:[.,]\\d+)?)|" +
                "(?:plafond|limite)\\s+(?:par acte|par actes?)\\s*[:]?\\s*(\\d+(?:[\\s\\d.,]*)?)|" +
                "(\\d+(?:[.,]\\d+)?)\\s*(?:€|euros?)?\\s*(?:par )?acte");
            if (plafonds.parActe == null) plafonds.parActe = 0.0;
        } catch (Exception e) {
            logger.warn("Erreur extraction plafonds: {}", e.getMessage());
            plafonds.annuel = 0.0;
            plafonds.mensuel = 0.0;
            plafonds.parActe = 0.0;
        }
        return plafonds;
    }
    public Double extractCoutMoyenParSinistre(String prompt) {
        Double result = extractDoubleWithPattern(prompt,
            "co[uû]t\\s+moyen\\s+de\\s+(\\d+(?:[.,]\\d+)?)|" +
            "co[uû]t\\s+moyen\\s+par\\s+sinistre\\s+de\\s+(\\d+(?:[.,]\\d+)?)|" +
            "coût\\s*[:]?\\s*(\\d+(?:[.,]\\d+)?)\\s*(?:€|euros?)?");
        return result != null ? result : 0.0;
    }
    public Integer extractDureeMinContrat(String prompt) {
        Integer result = extractIntegerWithPattern(prompt,
            "dur[ée]+\\s+(?:de\\s+)?contrat\\s+entre\\s+(\\d+)\\s+et|" +
            "(?:durée|duree)\\s+(?:minimum|min)\\s+(?:de )?contrat\\s*[:]?\\s*(\\d+)|" +
            "contrat\\s+d(?:e\\s+)?(\\d+)\\s+(?:mois|ans)|" +
            "dur[ée]+\\s+minimale\\s+(?:de\\s+)?(\\d+)");
        return result != null ? result : 0;
    }
    public Integer extractDureeMaxContrat(String prompt) {
        Integer result = extractIntegerWithPattern(prompt,
            "dur[ée]+\\s+(?:de\\s+)?contrat\\s+entre\\s+\\d+\\s+et\\s+(\\d+)|" +
            "(?:durée|duree)\\s+(?:maximum|max)\\s+(?:de )?contrat\\s*[:]?\\s*(\\d+)|" +
            "jusqu'à\\s+(\\d+)\\s+(?:mois|ans)\\s+de contrat|" +
            "dur[ée]+\\s+maximale\\s+(?:de\\s+)?(\\d+)");
        return result != null ? result : 0;
    }
    public Boolean extractResiliableAnnuellement(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.contains("résiliable chaque année") || 
            lowerPrompt.contains("resiliable chaque annee") ||
            lowerPrompt.contains("résiliable annuellement") ||
            lowerPrompt.contains("resiliable annuellement")) {
            return true;
        }
        if (lowerPrompt.contains("irrésiliable") || 
            lowerPrompt.contains("irresiliable") ||
            lowerPrompt.contains("non résiliable") ||
            lowerPrompt.contains("non resiliable")) {
            return false;
        }
        return true;
    }
    public Double extractFranchise(String prompt) {
        if (prompt == null || prompt.isBlank()) return 0.0;
        try {
            List<Pattern> patterns = List.of(
                Pattern.compile("franchise\\s+de\\s+(\\d+[.,]?\\d*)", Pattern.CASE_INSENSITIVE),
                Pattern.compile("franchise\\s*:\\s*(\\d+[.,]?\\d*)", Pattern.CASE_INSENSITIVE),
                Pattern.compile("franchise\\s+(\\d+[.,]?\\d*)", Pattern.CASE_INSENSITIVE),
                Pattern.compile("(?:sans|aucune)\\s+franchise", Pattern.CASE_INSENSITIVE)
            );
            for (Pattern pattern : patterns) {
                Matcher matcher = pattern.matcher(prompt);
                if (matcher.find()) {
                    String value = matcher.group(1);
                    if (value != null) {
                        String normalizedValue = value.replace(" ", "").replace(",", ".");
                        return Double.parseDouble(normalizedValue);
                    } else {
                        return 0.0;
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Erreur extraction franchise", e);
        }
        return 0.0;
    }
    public Double extractPrixMensuel(String prompt) {
        Double result = extractDoubleWithPattern(prompt,
            "(?:prix|co[uû]t|tarif)\\s+(?:mensuel|mensuelle)\\s*(?::|de|à|a|égale?|egale?)?\\s*(\\d+(?:[.,]\\d+)?)|" +
            "(?:prix|co[uû]t|tarif)\\s+(?:mensuel|mensuelle)\\s+(\\d+(?:[.,]\\d+)?)|" +
            "(\\d+(?:[.,]\\d+)?)\\s*(?:€|euros?)?\\s*(?:par )?mois");
        return result != null ? result : 0.0;
    }
    public Integer extractAgeMinimum(String prompt) {
        Integer result = extractIntegerWithPattern(prompt,
            "(?:âge|age)\\s+(?:minimum|min)\\s*[:]?\\s*(\\d+)|" +
            "à partir de\\s+(\\d+)\\s+ans");
        return result != null ? result : 0;
    }
    public Integer extractAgeMaximum(String prompt) {
        Integer result = extractIntegerWithPattern(prompt,
            "(?:âge|age)\\s+(?:maximum|max)\\s*[:]?\\s*(\\d+)|" +
            "jusqu'à\\s+(\\d+)\\s+ans");
        return result != null ? result : 0;
    }
    public String extractCouvertureGeographique(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.contains("international") || lowerPrompt.contains("monde")) return "INTERNATIONAL";
        if (lowerPrompt.contains("europe") || lowerPrompt.contains("ue") || lowerPrompt.contains("union européenne")) return "UE";
        if (lowerPrompt.contains("maghreb") || lowerPrompt.contains("afrique du nord")) return "MAGHREB";
        if (lowerPrompt.contains("national") || lowerPrompt.contains("france") || lowerPrompt.contains("tunisie")) return "NATIONAL";
        if (lowerPrompt.contains("régional") || lowerPrompt.contains("local")) return "REGIONAL";
        return "NATIONAL";
    }
    public String extractNiveauCouverture(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.contains("gold")) {
            return "GOLD";
        }
        if (lowerPrompt.contains("premium") || lowerPrompt.contains("supérieur") || lowerPrompt.contains("superieur")) {
            return "PREMIUM";
        }
        if (lowerPrompt.contains("silver") || lowerPrompt.contains("standard") || lowerPrompt.contains("moyen")) {
            return "STANDARD";
        }
        if (lowerPrompt.contains("bronze") || lowerPrompt.contains("basic") || lowerPrompt.contains("minimum")) {
            return "BASIC";
        }
        return "STANDARD";
    }
     // Types de clients explicitement mentionnés (liste vide si aucune occurrence).
     //Ne pas confondre avec la valeur par défaut métier : géré au niveau DTO / Pack.
    public List<String> extractTypeClientLabels(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return List.of();
        }
        List<String> found = new ArrayList<>();
        Pattern p1 = Pattern.compile(
            "type\\s+de\\s+clients?\\s*(?::|est|=)?\\s*(FAMILLE|FAMILIALE?|INDIVIDUEL(?:LE)?|ENTREPRISE|SENIOR)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
        Matcher m1 = p1.matcher(prompt);
        while (m1.find()) {
            mapClientToken(found, m1.group(1));
        }
        if (!found.isEmpty()) {
            return found;
        }
        Pattern p2 = Pattern.compile(
            "cible\\s+(?:clients?|clientèle)\\s*(?::|est|=)?\\s*(FAMILLE|FAMILIALE?|INDIVIDUEL(?:LE)?|ENTREPRISE|SENIOR)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
        Matcher m2 = p2.matcher(prompt);
        while (m2.find()) {
            mapClientToken(found, m2.group(1));
        }
        if (!found.isEmpty()) {
            return found;
        }
        Pattern p3 = Pattern.compile(
            "clients?\\s+(?:cible|type)\\s*(?::|est|=)?\\s*(FAMILLE|FAMILIALE?|INDIVIDUEL(?:LE)?|ENTREPRISE|SENIOR)",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
        Matcher m3 = p3.matcher(prompt);
        while (m3.find()) {
            mapClientToken(found, m3.group(1));
        }
        return found;
    }
    private static void mapClientToken(List<String> out, String raw) {
        if (raw == null) {
            return;
        }
        String u = raw.toUpperCase(Locale.FRENCH).trim();
        String label;
        if (u.startsWith("FAMIL")) {
            label = "FAMILLE";
        } else if (u.contains("INDIVID")) {
            label = "INDIVIDUEL";
        } else if (u.contains("ENTREPR")) {
            label = "ENTREPRISE";
        } else if (u.contains("SENIOR")) {
            label = "SENIOR";
        } else {
            label = null;
        }
        if (label != null && !out.contains(label)) {
            out.add(label);
        }
    }
    public Integer extractAncienneteContrat(String prompt) {
        Integer result = extractIntegerWithPattern(prompt,
            "(?:ancienneté|ancien)\\s*[:]?\\s*(\\d+)\\s*(?:mois|ans)|" +
            "(\\d+)\\s*(?:mois|ans)\\s+d'ancienneté");
        return result != null ? result : 0;
    }
    // ========== HELPERS POUR REGEX ==========
    private String extractValueWithPattern(String prompt, String regexPattern) {
        Pattern pattern = Pattern.compile(regexPattern, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            for (int i = 1; i <= matcher.groupCount(); i++) {
                String value = matcher.group(i);
                if (value != null && !value.trim().isEmpty()) {
                    return value.trim();
                }
            }
        }
        return null;
    }
    private Double extractDoubleWithPattern(String prompt, String regexPattern) {
        Pattern pattern = Pattern.compile(regexPattern, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            for (int i = 1; i <= matcher.groupCount(); i++) {
                String value = matcher.group(i);
                if (value != null && !value.trim().isEmpty()) {
                    try {
                        String normalizedValue = value.replaceAll("\\s+", "").replace(",", ".");
                        return Double.parseDouble(normalizedValue);
                    } catch (NumberFormatException e) {
                        logger.warn("Impossible de parser le nombre: {}", value);
                    }
                }
            }
        }
        return null;
    }
    private Integer extractIntegerWithPattern(String prompt, String regexPattern) {
        Pattern pattern = Pattern.compile(regexPattern, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            for (int i = 1; i <= matcher.groupCount(); i++) {
                String value = matcher.group(i);
                if (value != null && !value.trim().isEmpty()) {
                    try {
                        return Integer.parseInt(value);
                    } catch (NumberFormatException e) {
                        logger.warn("Impossible de parser l'entier: {}", value);
                    }
                }
            }
        }
        return null;
    }
    // ========== CLASSE INTERNE ==========
    public static class PlafondData {
        public Double annuel;
        public Double mensuel;
        public Double parActe;
        @Override
        public String toString() {
            return String.format("PlafondData{annuel=%s, mensuel=%s, parActe=%s}", 
                               annuel, mensuel, parActe);
        }
    }
}
/**
 * Service d'analyse UNIFIÉ et ROBUSTE pour la détection d'actions et l'extraction de données.
 * - Détection d'action ultra-robuste avec 3 niveaux de priorité
 * - Extraction de données via regex et patterns intelligents
 * - Fallback automatique en cas d'IA non disponible
 * - Logs détaillés pour débogage
 * - Gestion stricte des ambiguïtés
 *
 * PRIORITÉS DE DÉTECTION:
 * 1️⃣ Phrases explicites métier (100% confiance)
 * 2️⃣ Combinaisons action + entité distinctes (80% confiance)
 * 3️⃣ Détection par entité seule avec priorisation (60% confiance)
 */