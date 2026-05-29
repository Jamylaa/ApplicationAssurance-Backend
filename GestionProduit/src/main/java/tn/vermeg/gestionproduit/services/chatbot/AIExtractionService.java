package tn.vermeg.gestionproduit.services.chatbot;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AIExtractionService {

    private static final Logger logger = LoggerFactory.getLogger(AIExtractionService.class);

    @Value("${gemini.api-key:}")
    private String googleApiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String geminiModel;

    @Value("${gemini.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiUrl;

    @Value("${gemini.timeout-seconds:30}")
    private int timeoutSeconds;

    @Value("${gemini.max-retries:3}")
    private int maxRetries;

    @Value("${gemini.retry-delay-ms:1000}")
    private int retryDelayMs;

    @Value("${gemini.enabled:true}")
    private boolean geminiEnabled;

    @Value("${chatbot.ai-extraction-enabled:true}")
    private boolean aiExtractionEnabled;

    @Value("${chatbot.fallback-on-ai-error:true}")
    private boolean fallbackOnError;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AIExtractionService() {
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();
        this.objectMapper = new ObjectMapper();
    }

    // ========== EXTRACTION DONNÉES ==========

    public Map<String, Object> extractGarantieData(String prompt) {
        try {
            return callGoogleAIWithRetry(prompt + "\n\nExtrais les informations pour créer une garantie d'assurance. Retourne un JSON avec: nom, description, type, tauxRemboursement, typeMontant, plafond*, franchise, coutMoyenParSinistre, dureeMin/MaxContrat, resiliableAnnuellement, statut. Utilise null si absent.");
        } catch (Exception e) {
            logger.error("❌ Erreur extraction garantie IA: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    public Map<String, Object> extractProduitData(String prompt) {
        try {
            return callGoogleAIWithRetry(prompt + "\n\nExtrais les informations pourcreer un produit d'assurance. Retourne un JSON avec: nom, description, typeProduit (SANTE/AUTO/HABITATION/VIE/PREVOYANCE/EPARGNE), statut. Utilise null si absent.");
        } catch (Exception e) {
            logger.error("❌ Erreur extraction produit IA: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    public Map<String, Object> extractPackData(String prompt) {
        try {
            return callGoogleAIWithRetry(prompt + "\n\nExtrais les informations pour créer un pack d'assurance. Retourne un JSON avec: nom, description, age min/max, typeClients, couvertureGeographique, prixMensuel, dureeMin/MaxContrat, niveauCouverture, statut. Utilise null si absent.");
        } catch (Exception e) {
            logger.error("❌ Erreur extraction pack IA: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    public Map<String, Object> extractPackConfigurationData(String prompt) {
        try {
            return callGoogleAIWithRetry(prompt + "\n\nExtrais les informations pour configurer un pack: packId, garantieId, tauxRemboursement, plafond, franchise, optionnelle, supplementPrix. Utilise null si absent.");
        } catch (Exception e) {
            logger.error("❌ Erreur extraction configuration pack IA: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    public Map<String, Object> extractAddGarantieToPackData(String prompt) {
        try {
            return callGoogleAIWithRetry(prompt + "\n\nExtrais: nomPack, nomGarantie, tauxRemboursement, plafond, franchise, optionnelle. Utilise null si absent.");
        } catch (Exception e) {
            logger.error("❌ Erreur extraction ajout garantie pack IA: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    // ========== APPEL GEMINI AVEC RETRY ROBUSTE ==========

    private Map<String, Object> callGoogleAIWithRetry(String fullPrompt) throws IOException, InterruptedException {
        if (!isAIAvailable()) {
            logger.warn("⚠️ API KEY non configurée, fallback patterns");
            return new HashMap<>();
        }

        int attempt = 0;
        while (attempt < maxRetries) {
            try {
                logger.debug("🔄 Tentative {}/{} Gemini", attempt + 1, maxRetries);
                Map<String, Object> result = callGoogleAI(fullPrompt);
                if (!result.isEmpty()) {
                    logger.info("✅ Extraction IA réussie!");
                    return result;
                }
            } catch (Exception e) {
                logger.warn("⚠️ Tentative {} échouée: {}", attempt + 1, e.getMessage());
                attempt++;
                if (attempt < maxRetries) {
                    Thread.sleep(retryDelayMs);
                }
            }
        }

        if (fallbackOnError) {
            logger.warn("❌ Fallback patterns activé");
            return new HashMap<>();
        }
        return new HashMap<>();
    }

    private Map<String, Object> callGoogleAI(String fullPrompt) throws IOException, InterruptedException {
        String url = String.format("%s/%s:generateContent?key=%s", geminiUrl, geminiModel, googleApiKey);
        logger.debug("📡 Appel Gemini: {}", geminiModel);

        String requestBody = String.format("""
            {
              "contents": [{"parts": [{"text": "%s"}]}],
              "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 2048
              }
            }
            """, escapeJsonString(fullPrompt));

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(timeoutSeconds))
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            logger.error("❌ Gemini error {}: {}", response.statusCode(), response.body());
            throw new IOException("Gemini error: " + response.statusCode());
        }

        return parseAIResponse(response.body());
    }

    private String escapeJsonString(String str) {
        return str
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r");
    }

    private Map<String, Object> parseAIResponse(String aiResponse) {
        try {
            Pattern jsonPattern = Pattern.compile("\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}", Pattern.DOTALL);
            Matcher matcher = jsonPattern.matcher(aiResponse);
            if (matcher.find()) {
                Map<String, Object> result = objectMapper.readValue(cleanJsonString(matcher.group()), HashMap.class);
                logger.debug("✅ JSON parsed");
                return result;
            }
            logger.warn("⚠️ Aucun JSON trouvé");
            return new HashMap<>();
        } catch (Exception e) {
            logger.warn("⚠️ Parse error: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    private String cleanJsonString(String jsonStr) {
        jsonStr = jsonStr.replaceAll("(?<![\\\\])'([^']*)'", "\"$1\"");
        jsonStr = jsonStr.replaceAll("[\\x00-\\x1F]", "");
        return jsonStr;
    }

    public Map<String, Object> extractRecommendationData(String prompt) {
        try {
            return callGoogleAIWithRetry(prompt + "\n\nAnalyse le besoin client et retourne un JSON avec: typeProduit (SANTE/AUTO/HABITATION/VIE/PREVOYANCE/EPARGNE), budgetMensuel, age, typeClient (FAMILLE/INDIVIDUEL/ENTREPRISE/SENIOR), niveauCouverture (BASIC/STANDARD/PREMIUM/GOLD), garantiesRecherchees (liste de strings). Utilise null si absent.");
        } catch (Exception e) {
            logger.error("❌ Erreur extraction recommandation IA: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    // ========== HELPERS ==========

    public String getStringValue(Map<String, Object> data, String key, String defaultValue) {
        if (data == null) {
            return defaultValue;
        }
        Object value = data.get(key);
        if (value == null) {
            return defaultValue;
        }
        String s = value.toString().trim();
        return s.isEmpty() ? defaultValue : s;
    }

    public double getDoubleValue(Map<String, Object> data, String key, double defaultValue) {
        if (data == null) return defaultValue;
        Object value = data.get(key);
        if (value instanceof Number) return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(value.toString());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public int getIntegerValue(Map<String, Object> data, String key, int defaultValue) {
        if (data == null) return defaultValue;
        Object value = data.get(key);
        if (value instanceof Number) return ((Number) value).intValue();
        try {
            return Integer.parseInt(value.toString());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public boolean getBooleanValue(Map<String, Object> data, String key, boolean defaultValue) {
        if (data == null) return defaultValue;
        Object value = data.get(key);
        if (value instanceof Boolean) return (Boolean) value;
        try {
            return Boolean.parseBoolean(value.toString());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public boolean isAIAvailable() {
        return googleApiKey != null && !googleApiKey.trim().isEmpty() && geminiEnabled && aiExtractionEnabled;
    }
}
