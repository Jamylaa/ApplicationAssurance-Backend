package tn.vermeg.gestionproduit.services;

import org.springframework.stereotype.Service;
import tn.vermeg.gestionproduit.entities.Garantie;
import tn.vermeg.gestionproduit.entities.Statut;
import tn.vermeg.gestionproduit.entities.TypeGarantie;
import tn.vermeg.gestionproduit.repositories.GarantieRepository;
import java.time.Instant;
import java.util.List;

@Service
public class GarantieService {

    private final GarantieRepository garantieRepository;

    public GarantieService(GarantieRepository garantieRepository) {
        this.garantieRepository = garantieRepository;
    }

    // READ

    public List<Garantie> getAllGaranties() {
        return garantieRepository.findAll();
    }

    public Garantie getGarantieById(String idGarantie) {
        return garantieRepository.findById(idGarantie)
                .orElseThrow(() ->
                        new IllegalArgumentException("Garantie non trouvée avec l'ID: " + idGarantie));
    }

    public List<Garantie> getGarantiesByStatut(Statut statut) {
        return garantieRepository.findByStatut(statut);
    }

    public List<Garantie> getGarantiesByType(TypeGarantie typeGarantie) {
        return garantieRepository.findByTypeGarantie(typeGarantie);
    }

    public List<Garantie> searchGaranties(String nom) {
        return garantieRepository.findByNomGarantieContainingIgnoreCase(nom);
    }

    public List<Garantie> getGarantiesByTauxRemboursementMin(double tauxMin) {

        if (tauxMin < 0 || tauxMin > 1) {
            throw new IllegalArgumentException("Le taux doit être entre 0 et 1.");
        }

        return garantieRepository.findByTauxRemboursementGreaterThanEqual(tauxMin);
    }

    public List<Garantie> getGarantiesByPlafondMin(double plafondMin) {

        if (plafondMin < 0) {
            throw new IllegalArgumentException("Le plafond ne peut pas être négatif.");
        }

        return garantieRepository.findByPlafondAnnuelGreaterThanEqual(plafondMin);
    }

    // CREATE

    public Garantie createGarantie(Garantie garantie) {

        validateGarantie(garantie);

        if (garantieRepository.existsByNomGarantieIgnoreCase(garantie.getNomGarantie())) {
            throw new IllegalArgumentException("Une garantie avec ce nom existe déjà.");
        }

        garantie.setStatut(Statut.ACTIF);
        return garantieRepository.save(garantie);
    }

    // UPDATE

    public Garantie updateGarantie(String idGarantie, Garantie details) {

        Garantie garantie = getGarantieById(idGarantie);

        validateGarantie(details);

        boolean nomChange = !garantie.getNomGarantie()
                .equalsIgnoreCase(details.getNomGarantie());

        if (nomChange && garantieRepository.existsByNomGarantieIgnoreCase(details.getNomGarantie())) {
            throw new IllegalArgumentException("Une garantie avec ce nom existe déjà.");
        }

        garantie.setNomGarantie(details.getNomGarantie());
        garantie.setDescription(details.getDescription());
        garantie.setTypeGarantie(details.getTypeGarantie());
        garantie.setTauxRemboursement(details.getTauxRemboursement());
        garantie.setTypeMontant(details.getTypeMontant());
        garantie.setTypePlafond(details.getTypePlafond());
        garantie.setPlafondAnnuel(details.getPlafondAnnuel());
        garantie.setPlafondMensuel(details.getPlafondMensuel());
        garantie.setPlafondParActe(details.getPlafondParActe());
        garantie.setFranchise(details.getFranchise());
        garantie.setCoutMoyenParSinistre(details.getCoutMoyenParSinistre());
        garantie.setDureeMinContrat(details.getDureeMinContrat());
        garantie.setDureeMaxContrat(details.getDureeMaxContrat());
        garantie.setResiliableAnnuellement(details.isResiliableAnnuellement());
        garantie.setCreePar(details.getCreePar());

        return garantieRepository.save(garantie);
    }

    // DELETE / DESACTIVATION

    public void deleteGarantie(String idGarantie) {

        if (!garantieRepository.existsById(idGarantie)) {
            throw new IllegalArgumentException("Garantie non trouvée avec l'ID: " + idGarantie);
        }

        garantieRepository.deleteById(idGarantie);
    }

    public Garantie desactiverGarantie(String idGarantie) {

        Garantie garantie = getGarantieById(idGarantie);

        if (garantie.getStatut() == Statut.INACTIF) {
            throw new IllegalStateException("La garantie est déjà inactive.");
        }

        garantie.setStatut(Statut.INACTIF);
        garantie.setDateDesactivation(Instant.now());

        return garantieRepository.save(garantie);
    }

    // VALIDATION

    private void validateGarantie(Garantie garantie) {

        if (garantie.getNomGarantie() == null || garantie.getNomGarantie().isBlank()) {
            throw new IllegalArgumentException("Nom obligatoire.");
        }

        if (garantie.getTypeGarantie() == null) {
            throw new IllegalArgumentException("Type de garantie obligatoire.");
        }

        if (!garantie.estValide()) {
            throw new IllegalArgumentException("Paramètres financiers invalides.");
        }
    }
}