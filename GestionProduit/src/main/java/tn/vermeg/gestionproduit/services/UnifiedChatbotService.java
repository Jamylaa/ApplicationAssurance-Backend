package tn.vermeg.gestionproduit.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import tn.vermeg.gestionproduit.entities.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class UnifiedChatbotService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String processUserPrompt(String prompt) {
        try {
            ChatbotResponse response = analyzeAndGenerateAction(prompt);
            return objectMapper.writeValueAsString(response);
        } catch (Exception e) {
            return createErrorResponse(e.getMessage());
        }
    }

    private ChatbotResponse analyzeAndGenerateAction(String prompt) {
        String lowerPrompt = prompt.toLowerCase().trim();

        // Détection de l'intention principale
        if (containsAny(lowerPrompt, Arrays.asList("créer", "nouveau", "ajouter", "générer"))) {
            // Priorité 1: Détecter les packs avec garanties multiples
            if (containsAny(lowerPrompt, Arrays.asList("pack", "formule", "offre", "abonnement")) && 
                (containsGarantiesList(prompt) || 
                 lowerPrompt.contains("garanties") || 
                 lowerPrompt.contains("inclut") || 
                 lowerPrompt.contains("compren") ||
                 lowerPrompt.contains("comprend"))) {
                return createPackWithGarantiesAction(prompt);
            }
            // Priorité 2: Détecter les packs simples
            else if (containsAny(lowerPrompt, Arrays.asList("pack", "formule", "offre", "abonnement"))) {
                return createPackAction(prompt);
            }
            // Priorité 3: Détecter les garanties individuelles (uniquement si pas de pack)
            else if (containsAny(lowerPrompt, Arrays.asList("garantie", "couverture", "remboursement")) && 
                     !lowerPrompt.contains("pack")) {
                return createGarantieAction(prompt);
            }
            // Priorité 4: Détecter les produits
            else if (containsAny(lowerPrompt, Arrays.asList("produit", "assurance"))) {
                return createProduitAction(prompt);
            }
        } else if (containsAny(lowerPrompt, Arrays.asList("configurer", "modifier", "ajouter à", "pack"))) {
            return configurePackAction(prompt);
        }

        return createUnknownActionResponse();
    }

    private ChatbotResponse createGarantieAction(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        
        // Créer les objets imbriqués
        CouvertureData couverture = new CouvertureData();
        PlafondsData plafonds = new PlafondsData();
        ConditionsData conditions = new ConditionsData();
        
        GarantieStructuredData data = new GarantieStructuredData();

        // Type de garantie
        if (lowerPrompt.contains("hospitalisation")) {
            data.typeGarantie = "HOSPITALISATION";
            String nomHosp = extractName(prompt, "hospitalisation");
            data.nomGarantie = nomHosp != null ? nomHosp : "Garantie Hospitalisation";
        } else if (lowerPrompt.contains("dentaire")) {
            data.typeGarantie = "DENTAIRE";
            String nomDent = extractName(prompt, "dentaire");
            data.nomGarantie = nomDent != null ? nomDent : "Garantie Dentaire";
        } else if (lowerPrompt.contains("optique")) {
            data.typeGarantie = "OPTIQUE";
            String nomOpt = extractName(prompt, "optique");
            data.nomGarantie = nomOpt != null ? nomOpt : "Garantie Optique";
        } else if (lowerPrompt.contains("consultation")) {
            data.typeGarantie = "CONSULTATION";
            String nomCons = extractName(prompt, "consultation");
            data.nomGarantie = nomCons != null ? nomCons : "Garantie Consultation";
        } else {
            data.typeGarantie = "HOSPITALISATION";
            data.nomGarantie = "Garantie Standard";
        }

        // Taux de remboursement et type montant
        couverture.tauxRemboursement = extractPercentage(prompt);
        
        if (lowerPrompt.contains("frais réels") || lowerPrompt.contains("frais reels")) {
            couverture.typeMontant = "FRAIS_REELS";
        } else if (lowerPrompt.contains("forfait")) {
            couverture.typeMontant = "FORFAIT";
        } else if (lowerPrompt.contains("tarif conventionné") || lowerPrompt.contains("convention")) {
            couverture.typeMontant = "TARIF_CONVENTIONNE";
        } else {
            couverture.typeMontant = "FRAIS_REELS";
        }

        // Plafonds
        Double plafondAnnuel1 = extractAmount(prompt, "annuel");
        Double plafondAnnuel2 = extractAmount(prompt, "année");
        plafonds.annuel = plafondAnnuel1 != null ? plafondAnnuel1 : 
                          (plafondAnnuel2 != null ? plafondAnnuel2 : getDefaultPlafond(data.typeGarantie));
        
        Double plafondMensuel1 = extractAmount(prompt, "mensuel");
        Double plafondMensuel2 = extractAmount(prompt, "mois");
        plafonds.mensuel = plafondMensuel1 != null ? plafondMensuel1 : 
                           (plafondMensuel2 != null ? plafondMensuel2 : plafonds.annuel / 12);
        
        Double plafondParActe1 = extractAmount(prompt, "acte");
        Double plafondParActe2 = extractAmount(prompt, "par acte");
        plafonds.parActe = plafondParActe1 != null ? plafondParActe1 : 
                           (plafondParActe2 != null ? plafondParActe2 : plafonds.mensuel / 2);
        
        // Franchise
        Double franchise = extractAmount(prompt, "franchise");
        couverture.franchise = franchise != null ? franchise : 0.0;

        // Conditions contractuelles
        Integer dureeMin = extractDuration(prompt, "min");
        conditions.dureeMinContrat = dureeMin != null ? dureeMin : 12;
        
        Integer dureeMax = extractDuration(prompt, "max");
        conditions.dureeMaxContrat = dureeMax != null ? dureeMax : 60;
        conditions.resiliableAnnuellement = !lowerPrompt.contains("non résiliable") && !lowerPrompt.contains("irrésiliable");

        // Statut et audit
        data.statut = "ACTIF";
        data.coutMoyenParSinistre = plafonds.annuel * 0.05; // 5% du plafond annuel

        // Assembler la structure imbriquée
        data.couverture = couverture;
        data.plafonds = plafonds;
        data.conditions = conditions;

        // Créer la réponse structurée
        GarantieDataStructured structuredResponse = new GarantieDataStructured();
        structuredResponse.data = data;

        return new ChatbotResponse("CREATE_GARANTIE", structuredResponse);
    }

    private ChatbotResponse createPackAction(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        
        // Vérifier si le pack contient plusieurs garanties
        if (containsGarantiesList(prompt)) {
            return createPackWithGarantiesAction(prompt);
        }
        
        PackData data = new PackData();

        String nomPack = extractName(prompt, "pack");
        data.nomPack = nomPack != null ? nomPack : "Pack Standard";
        data.description = "Pack créé automatiquement par IA";

        // Âge
        Integer ageMin1 = extractAge(prompt, "minimum");
        Integer ageMin2 = extractAge(prompt, "min");
        data.ageMinimum = ageMin1 != null ? ageMin1 : (ageMin2 != null ? ageMin2 : 18);
        
        Integer ageMax1 = extractAge(prompt, "maximum");
        Integer ageMax2 = extractAge(prompt, "max");
        data.ageMaximum = ageMax1 != null ? ageMax1 : (ageMax2 != null ? ageMax2 : 65);

        // Prix
        Double prix1 = extractAmount(prompt, "prix");
        Double prix2 = extractAmount(prompt, "coût");
        data.prixMensuel = prix1 != null ? prix1 : (prix2 != null ? prix2 : 100.0);

        // Durée contrat
        Integer dureeMin1 = extractDuration(prompt, "min");
        data.dureeMinContrat = dureeMin1 != null ? dureeMin1 : 12;
        
        Integer dureeMax1 = extractDuration(prompt, "max");
        data.dureeMaxContrat = dureeMax1 != null ? dureeMax1 : 36;

        // Niveau couverture
        if (lowerPrompt.contains("premium") || lowerPrompt.contains("premium")) {
            data.niveauCouverture = "PREMIUM";
        } else if (lowerPrompt.contains("gold")) {
            data.niveauCouverture = "GOLD";
        } else {
            data.niveauCouverture = "BASIC";
        }

        // Type client
        List<String> typeClients = new ArrayList<>();
        if (lowerPrompt.contains("famille")) typeClients.add("FAMILLE");
        if (lowerPrompt.contains("individu") || lowerPrompt.contains("personne")) typeClients.add("INDIVIDUEL");
        if (lowerPrompt.contains("senior")) typeClients.add("SENIOR");
        if (lowerPrompt.contains("enfant")) typeClients.add("ENFANT");
        if (lowerPrompt.contains("étudiant") || lowerPrompt.contains("etudiant")) typeClients.add("ETUDIANT");
        if (lowerPrompt.contains("entreprise")) typeClients.add("ENTREPRISE");
        
        if (typeClients.isEmpty()) {
            typeClients.add("INDIVIDUEL");
        }
        data.typeClients = typeClients;

        // Couverture géographique
        if (lowerPrompt.contains("international") || lowerPrompt.contains("monde")) {
            data.couvertureGeographique = "INTERNATIONAL";
        } else if (lowerPrompt.contains("europe") || lowerPrompt.contains("ue")) {
            data.couvertureGeographique = "EUROPE";
        } else if (lowerPrompt.contains("maghreb")) {
            data.couvertureGeographique = "MAGHREB";
        } else {
            data.couvertureGeographique = "NATIONAL";
        }

        data.statut = "ACTIF";

        return new ChatbotResponse("CREATE_PACK", data);
    }
    
    private ChatbotResponse createPackWithGarantiesAction(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        PackWithGarantiesData data = new PackWithGarantiesData();

        // Informations du pack
        String nomPack = extractName(prompt, "pack");
        data.nomPack = nomPack != null ? nomPack : "Pack Standard";
        data.description = "Pack créé automatiquement par IA avec garanties";

        // Âge
        Integer ageMin1 = extractAge(prompt, "minimum");
        Integer ageMin2 = extractAge(prompt, "min");
        data.ageMinimum = ageMin1 != null ? ageMin1 : (ageMin2 != null ? ageMin2 : 18);
        
        Integer ageMax1 = extractAge(prompt, "maximum");
        Integer ageMax2 = extractAge(prompt, "max");
        data.ageMaximum = ageMax1 != null ? ageMax1 : (ageMax2 != null ? ageMax2 : 65);

        // Prix
        Double prix1 = extractAmount(prompt, "prix");
        Double prix2 = extractAmount(prompt, "coût");
        data.prixMensuel = prix1 != null ? prix1 : (prix2 != null ? prix2 : 100.0);

        // Durée contrat
        Integer dureeMin1 = extractDuration(prompt, "min");
        data.dureeMinContrat = dureeMin1 != null ? dureeMin1 : 12;
        
        Integer dureeMax1 = extractDuration(prompt, "max");
        data.dureeMaxContrat = dureeMax1 != null ? dureeMax1 : 36;

        // Niveau couverture
        if (lowerPrompt.contains("premium") || lowerPrompt.contains("premium")) {
            data.niveauCouverture = "PREMIUM";
        } else if (lowerPrompt.contains("gold")) {
            data.niveauCouverture = "GOLD";
        } else {
            data.niveauCouverture = "BASIC";
        }

        // Type client
        List<String> typeClients = new ArrayList<>();
        if (lowerPrompt.contains("famille")) typeClients.add("FAMILLE");
        if (lowerPrompt.contains("individu") || lowerPrompt.contains("personne")) typeClients.add("INDIVIDUEL");
        if (lowerPrompt.contains("senior")) typeClients.add("SENIOR");
        if (lowerPrompt.contains("enfant")) typeClients.add("ENFANT");
        if (lowerPrompt.contains("étudiant") || lowerPrompt.contains("etudiant")) typeClients.add("ETUDIANT");
        if (lowerPrompt.contains("entreprise")) typeClients.add("ENTREPRISE");
        
        if (typeClients.isEmpty()) {
            typeClients.add("INDIVIDUEL");
        }
        data.typeClients = typeClients;

        // Couverture géographique
        if (lowerPrompt.contains("international") || lowerPrompt.contains("monde")) {
            data.couvertureGeographique = "INTERNATIONAL";
        } else if (lowerPrompt.contains("europe") || lowerPrompt.contains("ue")) {
            data.couvertureGeographique = "EUROPE";
        } else if (lowerPrompt.contains("maghreb")) {
            data.couvertureGeographique = "MAGHREB";
        } else {
            data.couvertureGeographique = "NATIONAL";
        }

        // Extraire les garanties du prompt
        data.garanties = extractGarantiesFromPrompt(prompt);

        data.statut = "ACTIF";

        return new ChatbotResponse("CREATE_PACK_WITH_GARANTIES", data);
    }

    private ChatbotResponse createProduitAction(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        ProduitData data = new ProduitData();

        if (lowerPrompt.contains("santé") || lowerPrompt.contains("sante")) {
            data.typeProduit = "SANTE";
            String nomSante = extractName(prompt, "santé");
            data.nomProduit = nomSante != null ? nomSante : "Produit Santé";
        } else if (lowerPrompt.contains("habitation") || lowerPrompt.contains("logement")) {
            data.typeProduit = "HABITATION";
            String nomHabitation = extractName(prompt, "habitation");
            data.nomProduit = nomHabitation != null ? nomHabitation : "Produit Habitation";
        } else if (lowerPrompt.contains("auto") || lowerPrompt.contains("voiture")) {
            data.typeProduit = "AUTO";
            String nomAuto = extractName(prompt, "auto");
            data.nomProduit = nomAuto != null ? nomAuto : "Produit Auto";
        } else if (lowerPrompt.contains("epargne") || lowerPrompt.contains("épargne")) {
            data.typeProduit = "EPARGNE";
            String nomEpargne = extractName(prompt, "épargne");
            data.nomProduit = nomEpargne != null ? nomEpargne : "Produit Épargne";
        } else if (lowerPrompt.contains("vie")) {
            data.typeProduit = "VIE";
            String nomVie = extractName(prompt, "vie");
            data.nomProduit = nomVie != null ? nomVie : "Produit Vie";
        } else {
            data.typeProduit = "SANTE";
            data.nomProduit = "Produit Standard";
        }

        data.description = "Produit créé automatiquement par IA";
        data.statut = "ACTIF";

        return new ChatbotResponse("CREATE_PRODUIT", data);
    }

    private ChatbotResponse configurePackAction(String prompt) {
        // Pour la configuration de pack, on retourne une action spécialisée
        PackConfigData data = new PackConfigData();
        
        data.packId = extractId(prompt);
        data.action = "ADD_GARANTIE";
        data.garantieId = extractId(prompt);
        data.tauxRemboursement = extractPercentage(prompt);
        
        Double plafond = extractAmount(prompt, "plafond");
        data.plafond = plafond != null ? plafond : 1000.0;
        
        Double franchise = extractAmount(prompt, "franchise");
        data.franchise = franchise != null ? franchise : 0.0;
        
        data.optionnelle = prompt.toLowerCase().contains("optionnel") || prompt.toLowerCase().contains("optionnelle");
        
        Double supplement1 = extractAmount(prompt, "supplément");
        Double supplement2 = extractAmount(prompt, "supplement");
        data.supplementPrix = supplement1 != null ? supplement1 : (supplement2 != null ? supplement2 : 0.0);

        return new ChatbotResponse("CONFIGURE_PACK", data);
    }

    // Méthodes utilitaires d'extraction
    private String extractName(String prompt, String keyword) {
        Pattern pattern = Pattern.compile(keyword + "\\s+([^,.!?;]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }

    private Double extractPercentage(String prompt) {
        Pattern pattern = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*%");
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return Double.parseDouble(matcher.group(1)) / 100.0;
        }
        return 0.8; // Par défaut 80%
    }

    private Double extractAmount(String prompt, String context) {
        String regex = "";
        if (context.equals("annuel") || context.equals("année")) {
            regex = "(\\d+(?:\\.\\d+)?)\\s*(?:€|euros?)\\s*(?:par\\s*an|annuel|année)";
        } else if (context.equals("mensuel") || context.equals("mois")) {
            regex = "(\\d+(?:\\.\\d+)?)\\s*(?:€|euros?)\\s*(?:par\\s*mois|mensuel)";
        } else if (context.equals("acte") || context.equals("par acte")) {
            regex = "(\\d+(?:\\.\\d+)?)\\s*(?:€|euros?)\\s*(?:par\\s*acte|acte)";
        } else if (context.equals("franchise")) {
            regex = "franchise\\s*(?:de\\s*)?(\\d+(?:\\.\\d+)?)\\s*(?:€|euros?)";
        } else if (context.equals("prix") || context.equals("coût")) {
            regex = "(?:prix|coût)\\s*(?:de\\s*)?(\\d+(?:\\.\\d+)?)\\s*(?:€|euros?)";
        } else if (context.equals("plafond")) {
            regex = "plafond\\s*(?:de\\s*)?(\\d+(?:\\.\\d+)?)\\s*(?:€|euros?)";
        } else if (context.equals("supplément") || context.equals("supplement")) {
            regex = "(?:supplément|supplement)\\s*(?:de\\s*)?(\\d+(?:\\.\\d+)?)\\s*(?:€|euros?)";
        } else {
            regex = "(\\d+(?:\\.\\d+)?)\\s*(?:€|euros?)";
        }

        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return Double.parseDouble(matcher.group(1));
        }
        return null;
    }

    private Integer extractDuration(String prompt, String type) {
        String regex = "";
        if (type.equals("min")) {
            regex = "(\\d+)\\s*(?:mois|ans?)\\s*(?:minimum|min)";
        } else if (type.equals("max")) {
            regex = "(\\d+)\\s*(?:mois|ans?)\\s*(?:maximum|max)";
        }

        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            int value = Integer.parseInt(matcher.group(1));
            return matcher.group().toLowerCase().contains("an") ? value * 12 : value;
        }
        return null;
    }

    private Integer extractAge(String prompt, String type) {
        String regex = "";
        if (type.equals("minimum") || type.equals("min")) {
            regex = "(?:âge|age)\\s*(?:minimum|min)\\s*(?:de\\s*)?(\\d+)";
        } else if (type.equals("maximum") || type.equals("max")) {
            regex = "(?:âge|age)\\s*(?:maximum|max)\\s*(?:de\\s*)?(\\d+)";
        }

        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return null;
    }

    private String extractId(String prompt) {
        Pattern pattern = Pattern.compile("id\\s*[:=]?\\s*([a-zA-Z0-9]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
    
    private boolean containsGarantiesList(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        // Détecter si le prompt mentionne plusieurs garanties
        boolean hasKeyword = lowerPrompt.contains("garanties") || 
                           lowerPrompt.contains("inclut") || 
                           lowerPrompt.contains("compren") ||
                           lowerPrompt.contains("inclure") ||
                           lowerPrompt.contains("contient");
        
        boolean hasMultipleGaranties = (lowerPrompt.contains("garantie") && 
            ((lowerPrompt.contains("hospitalisation") && lowerPrompt.contains("consultation")) ||
             (lowerPrompt.contains("hospitalisation") && lowerPrompt.contains("dentaire")) ||
             (lowerPrompt.contains("consultation") && lowerPrompt.contains("dentaire"))));
        
        boolean hasPackWithGaranties = lowerPrompt.contains("pack") && 
            (lowerPrompt.contains("hospitalisation") || lowerPrompt.contains("consultation") || lowerPrompt.contains("dentaire"));
        
        boolean hasEnumeratedGaranties = lowerPrompt.matches(".*garantie.*garantie.*") ||
                                       lowerPrompt.matches(".*hospitalisation.*consultation.*") ||
                                       lowerPrompt.matches(".*hospitalisation.*dentaire.*") ||
                                       lowerPrompt.matches(".*consultation.*dentaire.*");
        
        return hasKeyword || hasMultipleGaranties || hasPackWithGaranties || hasEnumeratedGaranties;
    }
    
    private List<GarantieInPackData> extractGarantiesFromPrompt(String prompt) {
        List<GarantieInPackData> garanties = new ArrayList<>();
        String lowerPrompt = prompt.toLowerCase();
        
        // Extraire Hospitalisation
        if (lowerPrompt.contains("hospitalisation")) {
            GarantieInPackData garantie = new GarantieInPackData();
            garantie.nomGarantie = extractGarantieName(prompt, "hospitalisation");
            garantie.typeGarantie = "HOSPITALISATION";
            garantie.tauxRemboursement = extractGarantiePercentage(prompt, "hospitalisation");
            garantie.priorite = extractPriority(prompt, "hospitalisation");
            garantie.optionnelle = extractOptional(prompt, "hospitalisation");
            garanties.add(garantie);
        }
        
        // Extraire Consultation
        if (lowerPrompt.contains("consultation")) {
            GarantieInPackData garantie = new GarantieInPackData();
            garantie.nomGarantie = extractGarantieName(prompt, "consultation");
            garantie.typeGarantie = "CONSULTATION";
            garantie.tauxRemboursement = extractGarantiePercentage(prompt, "consultation");
            garantie.priorite = extractPriority(prompt, "consultation");
            garantie.optionnelle = extractOptional(prompt, "consultation");
            garanties.add(garantie);
        }
        
        // Extraire Dentaire
        if (lowerPrompt.contains("dentaire")) {
            GarantieInPackData garantie = new GarantieInPackData();
            garantie.nomGarantie = extractGarantieName(prompt, "dentaire");
            garantie.typeGarantie = "DENTAIRE";
            garantie.tauxRemboursement = extractGarantiePercentage(prompt, "dentaire");
            garantie.priorite = extractPriority(prompt, "dentaire");
            garantie.optionnelle = extractOptional(prompt, "dentaire");
            garanties.add(garantie);
        }
        
        // Extraire Optique
        if (lowerPrompt.contains("optique")) {
            GarantieInPackData garantie = new GarantieInPackData();
            garantie.nomGarantie = extractGarantieName(prompt, "optique");
            garantie.typeGarantie = "OPTIQUE";
            garantie.tauxRemboursement = extractGarantiePercentage(prompt, "optique");
            garantie.priorite = extractPriority(prompt, "optique");
            garantie.optionnelle = extractOptional(prompt, "optique");
            garanties.add(garantie);
        }
        
        return garanties;
    }
    
    private String extractGarantieName(String prompt, String garantieType) {
        String lowerPrompt = prompt.toLowerCase();
        
        // Chercher des noms spécifiques comme "Hospitalisation Premium"
        String[] patterns = {
            garantieType + "\\s+([^,.!?;]+?)(?:\\s*à|\\s*en|\\s*avec|\\s*en|\\s*priorité|\\s*obligatoire|\\s*optionnelle|$)",
            "([^,.!?;]*?" + garantieType + "[^,.!?;]*?)(?:\\s*à|\\s*en|\\s*avec|\\s*priorité|\\s*obligatoire|\\s*optionnelle|$)"
        };
        
        for (String regex : patterns) {
            Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(prompt);
            if (matcher.find()) {
                String name = matcher.group(1).trim();
                // Nettoyer le nom des pourcentages et autres détails
                name = name.replaceAll("\\d+%.*$", "").trim();
                name = name.replaceAll("priorité.*$", "").trim();
                name = name.replaceAll("obligatoire.*$", "").trim();
                name = name.replaceAll("optionnelle.*$", "").trim();
                
                if (!name.isEmpty() && !name.toLowerCase().equals(garantieType)) {
                    return name;
                }
            }
        }
        
        // Nom par défaut plus descriptif
        switch (garantieType) {
            case "hospitalisation": return "Hospitalisation Premium";
            case "consultation": return "Consultation Spécialisée";
            case "dentaire": return "Dentaire Standard";
            default: return "Garantie " + garantieType.substring(0, 1).toUpperCase() + garantieType.substring(1);
        }
    }
    
    private Double extractGarantiePercentage(String prompt, String garantieType) {
        // Chercher le pourcentage associé à cette garantie
        String regex = garantieType + "\\s+(?:[^,.!?;]*?)(\\d+(?:\\.\\d+)?)\\s*%";
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return Double.parseDouble(matcher.group(1)) / 100.0;
        }
        
        // Alternative : chercher après le nom de la garantie
        String name = extractGarantieName(prompt, garantieType);
        regex = name + "\\s+(?:[^,.!?;]*?)(\\d+(?:\\.\\d+)?)\\s*%";
        pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return Double.parseDouble(matcher.group(1)) / 100.0;
        }
        
        return 0.8; // Par défaut 80%
    }
    
    private Integer extractPriority(String prompt, String garantieType) {
        String lowerPrompt = prompt.toLowerCase();
        
        // Chercher "priorité X" près du type de garantie
        String[] patterns = {
            garantieType + "[^,.!?;]*?priorité\\s*(\\d+)",
            garantieType + "[^,.!?;]*?priorite\\s*(\\d+)",
            "priorité\\s*(\\d+)[^,.!?;]*?" + garantieType,
            "priorite\\s*(\\d+)[^,.!?;]*?" + garantieType
        };
        
        for (String regex : patterns) {
            Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(lowerPrompt);
            if (matcher.find()) {
                return Integer.parseInt(matcher.group(1));
            }
        }
        
        // Valeurs par défaut selon le type de garantie
        switch (garantieType) {
            case "hospitalisation": return 1; // Priorité haute
            case "consultation": return 2;  // Priorité moyenne
            case "dentaire": return 3;      // Priorité basse
            default: return 1;
        }
    }
    
    private Boolean extractOptional(String prompt, String garantieType) {
        String garantieSection = extractGarantieSection(prompt, garantieType);
        return garantieSection.toLowerCase().contains("optionnel") || 
               garantieSection.toLowerCase().contains("optionnelle");
    }
    
    private String extractGarantieSection(String prompt, String garantieType) {
        // Extraire la section du prompt qui concerne cette garantie
        String regex = "([^,.!?;]*" + garantieType + "[^,.!?;]*)";
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return "";
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

    private boolean containsAny(String text, List<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }

    private String createErrorResponse(String error) {
        return "{\"action\":\"ERROR\",\"error\":\"" + error.replace("\"", "\\\"") + "\"}";
    }

    private ChatbotResponse createUnknownActionResponse() {
        return new ChatbotResponse("UNKNOWN", Map.of("message", "Intention non reconnue. Veuillez spécifier créer une garantie, un pack ou un produit."));
    }

    // Classes de données pour les réponses
    public static class ChatbotResponse {
        private String action;
        private Object data;

        // Constructeur par défaut pour Jackson
        public ChatbotResponse() {}

        public ChatbotResponse(String action, Object data) {
            this.action = action;
            this.data = data;
        }

        // Getters & Setters
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
    }

    // Classes imbriquées pour une meilleure structure
    public static class CouvertureData {
        public double tauxRemboursement;
        public String typeMontant;
        public double franchise;
        
        public CouvertureData() {}
    }

    public static class PlafondsData {
        public double annuel;
        public double mensuel;
        public double parActe;
        
        public PlafondsData() {}
    }

    public static class ConditionsData {
        public int dureeMinContrat;
        public int dureeMaxContrat;
        public boolean resiliableAnnuellement;
        
        public ConditionsData() {}
    }

    public static class EligibiliteData {
        public Integer ageMinimum;
        public Integer ageMaximum;
        public List<String> typeClients;
        public int ancienneteContratMois;
        public String couvertureGeographique;
        
        public EligibiliteData() {}
    }

    public static class GarantieData {
        public String nomGarantie;
        public String typeGarantie;
        public String statut;
        public double coutMoyenParSinistre;
        public String creePar = "AI-Chatbot";
        
        // Structure imbriquée pour meilleure organisation
        public CouvertureData couverture;
        public PlafondsData plafonds;
        public ConditionsData conditions;
        
        // Constructeur par défaut pour Jackson
        public GarantieData() {}
    }

    // GarantieData structurée (nouvelle version)
    public static class GarantieDataStructured {
        public String type = "garantie";
        public GarantieStructuredData data;
        
        public GarantieDataStructured() {}
    }

    public static class GarantieStructuredData {
        public String nomGarantie;
        public String typeGarantie;
        public String statut;
        public double coutMoyenParSinistre;
        public String creePar = "AI-Chatbot";
        
        public CouvertureData couverture;
        public PlafondsData plafonds;
        public ConditionsData conditions;
        
        public GarantieStructuredData() {}
    }

    public static class PackData {
        public String nomPack;
        public String description;
        public Integer ageMinimum;
        public Integer ageMaximum;
        public List<String> typeClients;
        public int ancienneteContratMois = 0;
        public String couvertureGeographique = "NATIONAL";
        public double prixMensuel;
        public int dureeMinContrat;
        public int dureeMaxContrat;
        public String niveauCouverture;
        public String statut;
        
        // Constructeur par défaut pour Jackson
        public PackData() {}
    }

    public static class ProduitData {
        public String nomProduit;
        public String description;
        public String typeProduit;
        public String statut;
        
        // Constructeur par défaut pour Jackson
        public ProduitData() {}
    }

    public static class PackConfigData {
        public String packId;
        public String action;
        public String garantieId;
        public double tauxRemboursement;
        public double plafond;
        public double franchise;
        public boolean optionnelle;
        public double supplementPrix;
        public int delaiCarence = 0;
        public int priorite = 1;
        
        // Constructeur par défaut pour Jackson
        public PackConfigData() {}
    }

    public static class PackWithGarantiesData {
        public String nomPack;
        public String description;
        public Integer ageMinimum;
        public Integer ageMaximum;
        public List<String> typeClients;
        public int ancienneteContratMois = 0;
        public String couvertureGeographique = "NATIONAL";
        public double prixMensuel;
        public int dureeMinContrat;
        public int dureeMaxContrat;
        public String niveauCouverture;
        public String statut;
        public List<GarantieInPackData> garanties;
        
        // Constructeur par défaut pour Jackson
        public PackWithGarantiesData() {
            this.garanties = new ArrayList<>();
        }
    }

    public static class GarantieInPackData {
        public String nomGarantie;
        public String typeGarantie;
        public double tauxRemboursement;
        public int priorite;
        public boolean optionnelle;
        
        // Constructeur par défaut pour Jackson
        public GarantieInPackData() {}
    }
}
