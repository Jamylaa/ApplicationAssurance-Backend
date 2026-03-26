package tn.vermeg.recommendation.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.vermeg.recommendation.entities.RecommendationResult;
import java.util.List;
@Repository
public interface RecommendationResultRepository extends MongoRepository<RecommendationResult, String> {
    List<RecommendationResult> findByClientId(String clientId);
    List<RecommendationResult> findByQuestionnaireId(String questionnaireId);
}