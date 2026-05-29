package tn.vermeg.gestionproduit.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import tn.vermeg.gestionproduit.entities.Pack;
import tn.vermeg.gestionproduit.entities.Produit;
import tn.vermeg.gestionproduit.entities.PackGarantie;
import tn.vermeg.gestionproduit.entities.NiveauCouverture;
import tn.vermeg.gestionproduit.entities.CouvertureGeographique;
import tn.vermeg.gestionproduit.entities.Statut;
import tn.vermeg.gestionproduit.repositories.PackRepository;
import tn.vermeg.gestionproduit.repositories.ProduitRepository;
import tn.vermeg.gestionproduit.repositories.PackGarantieRepository;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service that scores Packs and Produits against a client profile.
 * Uses simple, explainable rules described in the task.
 */
@Service
public class ScoringService {

    private final PackRepository packRepository;
    private final PackGarantieRepository packGarantieRepository;
    private final ProduitRepository produitRepository;

    @Autowired
    public ScoringService(PackRepository packRepository,
                          PackGarantieRepository packGarantieRepository,
                          ProduitRepository produitRepository) {
        this.packRepository = packRepository;
        this.packGarantieRepository = packGarantieRepository;
        this.produitRepository = produitRepository;
    }

    public List<RecommendationDTO> recommendPacks(ClientProfile profile) {
        List<Pack> packs = packRepository.findAll();

        List<RecommendationDTO> scored = new ArrayList<>();

        for (Pack p : packs) {
            if (p.getStatut() != Statut.ACTIF) continue;

            int score = 0;
            List<String> reasons = new ArrayList<>();

            // Age compatibility
            Integer min = p.getAgeMinimum();
            Integer max = p.getAgeMaximum();
            if (min != null && max != null) {
                if (profile.age() >= min && profile.age() <= max) {
                    score += 30;
                    reasons.add("Age compatible (+30)");
                }
            }

            // Budget fit
            double price = p.getPrixMensuel();
            if (profile.budget() >= price) {
                score += 25;
                reasons.add("Budget fits (+25)");
                if (profile.budget() >= 1.5 * price) {
                    score += 10; // bonus
                    reasons.add("High budget bonus (+10)");
                }
            }

            // Guarantees match
            List<PackGarantie> garanties = packGarantieRepository.findByPackId(p.getIdPack());
            Set<String> packGarantiesNames = garanties.stream()
                    .filter(Objects::nonNull)
                    .map(PackGarantie::getNomGarantie)
                    .filter(Objects::nonNull)
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet());

            int matches = 0;
            for (String wanted : profile.garantiesVoulu()) {
                if (wanted == null) continue;
                if (packGarantiesNames.contains(wanted.toLowerCase())) {
                    score += 10;
                    matches++;
                }
            }
            if (matches > 0) reasons.add("Matched garanties: " + matches + " (+" + (matches * 10) + ")");

            // Coverage level
            NiveauCouverture niv = p.getNiveauCouverture();
            if (niv != null) {
                int add = 0;
                if (niv == NiveauCouverture.PREMIUM) add = 15;
                else if (niv == NiveauCouverture.GOLD) add = 10;
                else add = 5; // BASIC or default
                score += add;
                reasons.add("Coverage level " + niv + " (+" + add + ")");
            }

            // Geographic coverage
            CouvertureGeographique cov = p.getCouvertureGeographique();
            if (cov != null && profile.couvertureGeographique() != null) {
                try {
                    CouvertureGeographique clientCov = CouvertureGeographique.valueOf(profile.couvertureGeographique().toUpperCase());
                    if (cov == clientCov) {
                        score += 10;
                        reasons.add("Geographic coverage match (+10)");
                    }
                } catch (Exception ignored) { }
            }

            // Product type preference bonus
            String preferredType = profile.produitTypePreferee();
            if (preferredType != null && !preferredType.isBlank() && p.getProduitId() != null) {
                var matchedProduit = produitRepository.findById(p.getProduitId());
                if (matchedProduit.isPresent()) {
                    var prod = matchedProduit.get();
                    if (prod.getTypeProduit() != null && prod.getTypeProduit().name().equalsIgnoreCase(preferredType)) {
                        score += 15;
                        reasons.add("Produit associé correspond au type demandé (+15)");
                    }
                }
            }

            String reason = String.join("; ", reasons);

            scored.add(new RecommendationDTO(p.getIdPack(), p.getNomPack(), score, reason));
        }

        return scored.stream()
                .sorted(Comparator.comparingInt(RecommendationDTO::score).reversed())
                .collect(Collectors.toList());
    }

    public List<RecommendationDTO> recommendProduits(ClientProfile profile) {
        List<Produit> produits = produitRepository.findAll();

        List<RecommendationDTO> scored = new ArrayList<>();

        for (Produit prod : produits) {
            int score = 0;
            List<String> reasons = new ArrayList<>();

            if (prod.getStatut() != Statut.ACTIF) {
                continue;
            }
            score += 30;
            reasons.add("Produit actif (+30)");

            if (profile.produitTypePreferee() != null && !profile.produitTypePreferee().isBlank() && prod.getTypeProduit() != null
                    && prod.getTypeProduit().name().equalsIgnoreCase(profile.produitTypePreferee())) {
                score += 25;
                reasons.add("Correspondance avec le type de produit demandé (+25)");
            }

            if (prod.getTypeProduit() != null) {
                switch (prod.getTypeProduit()) {
                    case SANTE -> { score += 20; reasons.add("Type SANTE (+20)"); }
                    case VIE -> { score += 15; reasons.add("Type VIE (+15)"); }
                    case AUTO, HABITATION -> { score += 10; reasons.add("Type AUTO/HABITATION (+10)"); }
                    default -> { score += 5; reasons.add("Other type (+5)"); }
                }
            }

            scored.add(new RecommendationDTO(prod.getIdProduit(), prod.getNomProduit(), score, String.join("; ", reasons)));
        }

        return scored.stream()
                .sorted(Comparator.comparingInt(RecommendationDTO::score).reversed())
                .collect(Collectors.toList());
    }

    // === DTOs ===
    public static record ClientProfile(
            String sexe,
            int age,
            int nombreBeneficiaires,
            double budget,
            List<String> garantiesVoulu,
            String couvertureGeographique,
            String produitTypePreferee
    ) {}

    public static record RecommendationDTO(String packId, String nomPack, int score, String reason) {}

}
