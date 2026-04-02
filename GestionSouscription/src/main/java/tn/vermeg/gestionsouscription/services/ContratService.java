package tn.vermeg.gestionsouscription.services;
import org.springframework.stereotype.Service;
import tn.vermeg.gestionsouscription.entities.Contrat;
import tn.vermeg.gestionsouscription.repositories.ContratRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;
 // Service de gestion des contrats (CRUD, renouvellement, résiliation).
@Service
public class ContratService {

    private final ContratRepository contratRepository;
    public ContratService(ContratRepository contratRepository) {
        this.contratRepository = contratRepository;}
    public List<Contrat> getAllContrats() {
        return contratRepository.findAll();}
    public Optional<Contrat> getContratById(String idContrat) {
        return contratRepository.findById(idContrat);}
    public List<Contrat> getContratsByClientId(String clientId) {
        return contratRepository.findByClientId(clientId);}
    public List<Contrat> getContratsByClientEmail(String email) {
        return contratRepository.findByClientEmail(email);}
    public List<Contrat> getContratsByProduitId(String produitId) {
        return contratRepository.findByProduitId(produitId);}
    public List<Contrat> getContratsByStatut(String statut) {
        return contratRepository.findByStatut(statut);}
     // Renouvellement : prolonge la date de fin du contrat.
    public Contrat renouvelerContrat(String idContrat, int dureeMois) {
        Contrat contrat = contratRepository.findById(idContrat)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé: " + idContrat));
        Date nouvelleFin = new Date(contrat.getDateFin().getTime() + (long) dureeMois * 30L * 24 * 60 * 60 * 1000);
        contrat.setDateFin(nouvelleFin);
        contrat.setDureeMois(contrat.getDureeMois() + dureeMois);
        contrat.setStatut("ACTIF");
        return contratRepository.save(contrat);}
     //Résiliation d'un contrat.
    public Contrat resilierContrat(String idContrat) {
        Contrat contrat = contratRepository.findById(idContrat)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé: " + idContrat));
        contrat.setStatut("RESILIE");
        return contratRepository.save(contrat);}
    public Contrat updateContrat(String idContrat, Contrat contrat) {
        if (!contratRepository.existsById(idContrat)) {
            throw new RuntimeException("Contrat non trouvé: " + idContrat);}
        contrat.setIdContrat(idContrat);
        return contratRepository.save(contrat);}
     //Suppression d'un contrat.
    public void supprimerContrat(String idContrat) {
        contratRepository.deleteById(idContrat);
    }
}