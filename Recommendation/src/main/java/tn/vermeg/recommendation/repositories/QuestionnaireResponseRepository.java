package tn.vermeg.recommendation.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import tn.vermeg.recommendation.entities.QuestionnaireResponse;
import java.util.List;
@Repository
public interface QuestionnaireResponseRepository extends MongoRepository<QuestionnaireResponse, String> {
    List<QuestionnaireResponse> findByClientId(String clientId);
}