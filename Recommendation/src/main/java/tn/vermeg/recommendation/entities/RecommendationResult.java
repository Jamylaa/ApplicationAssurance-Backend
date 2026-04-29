package tn.vermeg.recommendation.entities;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;
@Document(collection = "recommendation_results")
public class RecommendationResult {

    @Id
    private String id;
    private String questionnaireId;
    private String clientId;
    private List<ScoredPack> scoredPacks;
    private Date dateRecommendation;
    public RecommendationResult() {}
    public RecommendationResult(String id, String questionnaireId, String clientId,
                                List<ScoredPack> scoredPacks, Date dateRecommendation) {
        this.id = id;
        this.questionnaireId = questionnaireId;
        this.clientId = clientId;
        this.scoredPacks = scoredPacks;
        this.dateRecommendation = dateRecommendation;}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getQuestionnaireId() { return questionnaireId; }
    public void setQuestionnaireId(String questionnaireId) { this.questionnaireId = questionnaireId; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public List<ScoredPack> getScoredPacks() { return scoredPacks; }
    public void setScoredPacks(List<ScoredPack> scoredPacks) { this.scoredPacks = scoredPacks; }
    public Date getDateRecommendation() { return dateRecommendation; }
    public void setDateRecommendation(Date dateRecommendation) { this.dateRecommendation = dateRecommendation; }
}