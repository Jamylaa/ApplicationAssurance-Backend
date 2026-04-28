package tn.vermeg.gestionproduit.services;

import org.springframework.stereotype.Service;
import tn.vermeg.gestionproduit.entities.NiveauCouverture;
import tn.vermeg.gestionproduit.entities.Pack;
import tn.vermeg.gestionproduit.entities.Statut;
import tn.vermeg.gestionproduit.entities.TypeClient;
import tn.vermeg.gestionproduit.repositories.PackRepository;

import java.util.List;

@Service
public class PackService {

    private final PackRepository packRepository;

    public PackService(PackRepository packRepository) {
        this.packRepository = packRepository;
    }

    // READ

    public List<Pack> getAllPacks() {
        return packRepository.findAll();
    }

    public Pack getPackById(String idPack) {
        return packRepository.findById(idPack)
                .orElseThrow(() ->
                        new IllegalArgumentException("Pack non trouvé avec l'ID: " + idPack));
    }

    // CREATE

    public Pack createPack(Pack pack) {

        validatePack(pack);

        if (packRepository.existsByNomPackIgnoreCase(pack.getNomPack())) {
            throw new IllegalArgumentException("Un pack avec ce nom existe déjà.");
        }

        pack.setStatut(Statut.ACTIF);

        return packRepository.save(pack);
    }

    // UPDATE

    public Pack updatePack(String idPack, Pack details) {

        Pack pack = getPackById(idPack);

        validatePack(details);

        boolean nomChange = !pack.getNomPack()
                .equalsIgnoreCase(details.getNomPack());

        if (nomChange && packRepository.existsByNomPackIgnoreCase(details.getNomPack())) {
            throw new IllegalArgumentException("Un pack avec ce nom existe déjà.");
        }

        pack.setNomPack(details.getNomPack());
        pack.setDescription(details.getDescription());
        pack.setProduitId(details.getProduitId());
        pack.setNomProduit(details.getNomProduit());
        pack.setPrixMensuel(details.getPrixMensuel());
        pack.setDureeMinContrat(details.getDureeMinContrat());
        pack.setDureeMaxContrat(details.getDureeMaxContrat());
        pack.setStatut(details.getStatut());

        return packRepository.save(pack);
    }

    // DELETE

    public void deletePack(String idPack) {

        if (!packRepository.existsById(idPack)) {
            throw new IllegalArgumentException("Pack non trouvé avec l'ID: " + idPack);
        }

        packRepository.deleteById(idPack);
    }

    // DESACTIVER

    public Pack desactiverPack(String idPack) {

        Pack pack = getPackById(idPack);

        pack.setStatut(Statut.INACTIF);

        return packRepository.save(pack);
    }

    // FILTRES

    public List<Pack> getPacksByProduit(String produitId) {
        return packRepository.findByProduitId(produitId);
    }

    public List<Pack> getPacksByStatut(Statut statut) {
        return packRepository.findByStatut(statut);
    }

    public List<Pack> searchPacks(String nom) {
        return packRepository.findByNomPackContainingIgnoreCase(nom);
    }

    public List<Pack> getPacksByPrixRange(double prixMin, double prixMax) {

        if (prixMin < 0 || prixMax < 0 || prixMin > prixMax) {
            throw new IllegalArgumentException("Intervalle de prix invalide.");
        }

        return packRepository.findByPrixMensuelBetween(prixMin, prixMax);
    }

    public List<Pack> getPacksByNiveauCouverture(NiveauCouverture niveauCouverture) {
        return packRepository.findByNiveauCouverture(niveauCouverture);
    }

    public List<Pack> getPacksByTypeClient(TypeClient typeClient) {
        return packRepository.findByTypeClientsContaining(typeClient);
    }

    // VALIDATION

    private void validatePack(Pack pack) {

        if (pack.getNomPack() == null || pack.getNomPack().isBlank()) {
            throw new IllegalArgumentException("Nom du pack obligatoire.");
        }

        if (pack.getPrixMensuel() < 0) {
            throw new IllegalArgumentException("Prix invalide.");
        }
    }
}