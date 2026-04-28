package tn.vermeg.gestionproduit.services;

import org.springframework.stereotype.Service;
import tn.vermeg.gestionproduit.entities.*;
import tn.vermeg.gestionproduit.repositories.GarantieRepository;
import tn.vermeg.gestionproduit.repositories.PackGarantieRepository;
import tn.vermeg.gestionproduit.repositories.PackRepository;

import java.util.List;

@Service
public class PackConfigurationService {

    private final PackRepository packRepository;
    private final PackGarantieRepository packGarantieRepository;
    private final GarantieRepository garantieRepository;

    public PackConfigurationService(PackRepository packRepository,
                                    PackGarantieRepository packGarantieRepository,
                                    GarantieRepository garantieRepository) {
        this.packRepository = packRepository;
        this.packGarantieRepository = packGarantieRepository;
        this.garantieRepository = garantieRepository;
    }

    // AJOUT GARANTIE AU PACK

    public PackGarantie ajouterGarantieAuPack(String packId, String garantieId, PackGarantie packGarantie) {

        Pack pack = packRepository.findById(packId)
                .orElseThrow(() -> new IllegalArgumentException("Pack non trouvé"));

        Garantie garantie = garantieRepository.findById(garantieId)
                .orElseThrow(() -> new IllegalArgumentException("Garantie non trouvée"));

        //  Vérifier duplication
        if (packGarantieRepository.existsByPackIdAndGarantieId(packId, garantieId)) {
            throw new IllegalArgumentException("Garantie déjà ajoutée à ce pack");
        }

        // 🔥 Initialisation propre
        packGarantie.setPackId(packId);
        packGarantie.setGarantieId(garantieId);
        packGarantie.setNomGarantie(garantie.getNomGarantie());

        packGarantie.setPriorite(packGarantie.getPriorite() <= 0 ? 1 : packGarantie.getPriorite());
        packGarantie.setActif(true);
        packGarantie.setDelaiCarence(Math.max(packGarantie.getDelaiCarence(), 0));

        return packGarantieRepository.save(packGarantie);
    }

    // SUPPRESSION

    public void supprimerGarantieDuPack(String packId, String packGarantieId) {

        packRepository.findById(packId)
                .orElseThrow(() -> new IllegalArgumentException("Pack non trouvé"));

        PackGarantie pg = packGarantieRepository.findById(packGarantieId)
                .orElseThrow(() -> new IllegalArgumentException("PackGarantie non trouvée"));

        // 🔥 Vérifier cohérence
        if (!pg.getPackId().equals(packId)) {
            throw new IllegalArgumentException("Cette garantie n'appartient pas à ce pack");
        }

        packGarantieRepository.deleteById(packGarantieId);
    }

    // MODIFICATION

    public PackGarantie modifierGarantieDansPack(String packId, String packGarantieId, PackGarantie details) {

        packRepository.findById(packId)
                .orElseThrow(() -> new IllegalArgumentException("Pack non trouvé"));

        PackGarantie pg = packGarantieRepository.findById(packGarantieId)
                .orElseThrow(() -> new IllegalArgumentException("PackGarantie non trouvée"));

        // 🔥 Vérifier cohérence
        if (!pg.getPackId().equals(packId)) {
            throw new IllegalArgumentException("Cette garantie n'appartient pas à ce pack");
        }

        // 🔥 Update contrôlé
        pg.setTauxRemboursement(details.getTauxRemboursement());
        pg.setPlafond(details.getPlafond());
        pg.setFranchise(details.getFranchise());
        pg.setTypeMontant(details.getTypeMontant());
        pg.setOptionnelle(details.isOptionnelle());
        pg.setSupplementPrix(details.getSupplementPrix());

        return packGarantieRepository.save(pg);
    }

    // ======================
    // LECTURE
    // ======================

    public List<PackGarantie> getGarantiesDuPack(String packId) {
        return packGarantieRepository.findByPackId(packId);
    }

    public List<PackGarantie> getGarantiesInclusesDuPack(String packId) {
        return packGarantieRepository.findByPackIdAndOptionnelle(packId, false);
    }

    public List<PackGarantie> getGarantiesOptionnellesDuPack(String packId) {
        return packGarantieRepository.findByPackIdAndOptionnelle(packId, true);
    }

    // ======================
    // PRIX TOTAL PACK
    // ======================

    public double calculerPrixTotalPack(String packId) {

        Pack pack = packRepository.findById(packId)
                .orElseThrow(() -> new IllegalArgumentException("Pack non trouvé"));

        List<PackGarantie> garanties = packGarantieRepository.findByPackId(packId);

        double supplement = garanties.stream()
                .filter(PackGarantie::isOptionnelle)
                .mapToDouble(PackGarantie::getSupplementPrix)
                .sum();

        return pack.getPrixMensuel() + supplement;
    }

    // ======================
    // CREATION PACK + GARANTIES
    // ======================

    public Pack creerPackAvecGaranties(Pack pack, List<String> garantieIds) {

        // Validation du pack
        if (pack.getNomPack() == null || pack.getNomPack().isBlank()) {
            throw new IllegalArgumentException("Nom du pack obligatoire");
        }
        if (pack.getPrixMensuel() <= 0) {
            throw new IllegalArgumentException("Le prix mensuel doit être positif");
        }
//        if (pack.getDureeMin() <= 0 || pack.getDureeMax() <= 0) {
//            throw new IllegalArgumentException("Les durées doivent être positives");
//        }
//        if (pack.getDureeMin() > pack.getDureeMax()) {
//            throw new IllegalArgumentException("La durée minimale doit être inférieure à la durée maximale");
//        }

        Pack savedPack = packRepository.save(pack);

        for (String garantieId : garantieIds) {

            Garantie garantie = garantieRepository.findById(garantieId)
                    .orElseThrow(() -> new IllegalArgumentException("Garantie non trouvée"));

            // 🔥 éviter duplication
            if (packGarantieRepository.existsByPackIdAndGarantieId(savedPack.getIdPack(), garantieId)) {
                continue;
            }

            PackGarantie pg = new PackGarantie();
            pg.setPackId(savedPack.getIdPack());
            pg.setGarantieId(garantieId);
            pg.setNomGarantie(garantie.getNomGarantie());

            pg.setTauxRemboursement(garantie.getTauxRemboursement());
            pg.setPlafond(garantie.getPlafondAnnuel());
            pg.setFranchise(garantie.getFranchise());
            pg.setTypeMontant(garantie.getTypeMontant());

            pg.setOptionnelle(false);
            pg.setSupplementPrix(0.0);
            pg.setActif(true);
            pg.setDelaiCarence(0);
            pg.setPriorite(1);

            packGarantieRepository.save(pg);
        }

        return savedPack;
    }

    // GARANTIES DISPONIBLES

    public List<Garantie> getGarantiesDisponiblesPourPack(String packId) {

        List<Garantie> toutes = garantieRepository.findByStatut(Statut.ACTIF);
        List<PackGarantie> existantes = packGarantieRepository.findByPackId(packId);

        return toutes.stream()
                .filter(g -> existantes.stream()
                        .noneMatch(pg -> pg.getGarantieId().equals(g.getIdGarantie())))
                .toList();
    }
}