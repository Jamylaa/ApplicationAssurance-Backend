package tn.vermeg.recommendation.controllers;

import org.springframework.web.bind.annotation.*;
import tn.vermeg.recommendation.entities.QuestionnaireResponse;
import tn.vermeg.recommendation.entities.RecommendationResult;
import tn.vermeg.recommendation.services.RecommendationService;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;}
    // Évaluer et recommander les packs à partir d'un questionnaire.
     // Le corps de la requête contient les réponses du chatbot.
    @PostMapping("/evaluate")
    public RecommendationResult evaluate(@RequestBody QuestionnaireResponse questionnaire) {
        return recommendationService.evaluate(questionnaire); }

    // Récupérer un résultat de recommandation par son ID.
    @GetMapping("/{id}")
    public RecommendationResult getById(@PathVariable String id) {
        return recommendationService.getById(id);}

     // Récupérer l'historique des recommandations d'un client.
    @GetMapping("/client/{clientId}")
    public List<RecommendationResult> getByClientId(@PathVariable String clientId) {
        return recommendationService.getByClientId(clientId); }

     // Récupérer les questionnaires d'un client.
    @GetMapping("/questionnaires/{clientId}")
    public List<QuestionnaireResponse> getQuestionnairesByClient(@PathVariable String clientId) {
        return recommendationService.getQuestionnairesByClientId(clientId);}
}