package tn.vermeg.recommendation.entities;
import java.util.List;
 // Représente un pack avec son score de pertinence pour un client donné.
public class ScoredPack {

    private String packId;
    private String nomPack;
    private double score; // 0-100
    private List<String> raisons; // explications du score
    public ScoredPack() {}
    public ScoredPack(String packId, String nomPack, double score, List<String> raisons) {
        this.packId = packId;
        this.nomPack = nomPack;
        this.score = score;
        this.raisons = raisons;}
    public String getPackId() { return packId; }
    public void setPackId(String packId) { this.packId = packId; }
    public String getNomPack() { return nomPack; }
    public void setNomPack(String nomPack) { this.nomPack = nomPack; }
    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
    public List<String> getRaisons() { return raisons; }
    public void setRaisons(List<String> raisons) { this.raisons = raisons; }
}