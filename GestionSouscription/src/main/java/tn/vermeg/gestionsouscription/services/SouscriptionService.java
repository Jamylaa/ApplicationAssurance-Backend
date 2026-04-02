package tn.vermeg.gestionsouscription.services;
import org.springframework.stereotype.Service;
import tn.vermeg.gestionsouscription.dto.ProduitDTO;
import tn.vermeg.gestionsouscription.dto.ClientDTO;
import tn.vermeg.gestionsouscription.dto.PackDTO;
import tn.vermeg.gestionsouscription.dto.SouscriptionRequest;
import tn.vermeg.gestionsouscription.entities.Contrat;
import tn.vermeg.gestionsouscription.feign.PackServiceClient;
import tn.vermeg.gestionsouscription.feign.ProduitServiceClient;
import tn.vermeg.gestionsouscription.feign.UserServiceClient;
import tn.vermeg.gestionsouscription.repositories.ContratRepository;
import java.util.Date;
/**
 * Service d'orchestration pour la souscription.
 * Récupère les données client et produit via Feign, puis crée un contrat enrichi.
 */
@Service
public class SouscriptionService {
    private final ContratRepository contratRepository;
    private final UserServiceClient userServiceClient;
    private final ProduitServiceClient produitServiceClient;
    private final PackServiceClient packServiceClient;
    public SouscriptionService(ContratRepository contratRepository,
                               UserServiceClient userServiceClient,
                               ProduitServiceClient produitServiceClient,
                               PackServiceClient packServiceClient) {
        this.contratRepository = contratRepository;
        this.userServiceClient = userServiceClient;
        this.produitServiceClient = produitServiceClient;
        this.packServiceClient = packServiceClient;
    }
    /**
     * Crée une souscription complète :
     * 1. Récupère le client depuis GestionUser via Feign
     * 2. Récupère le produit depuis GestionProduit via Feign
     * 3. Vérifie l'éligibilité du client pour le produit
     * 4. Crée un contrat enrichi avec snapshot des données
     */
    public Contrat creerSouscription(SouscriptionRequest request) {
        // 1. Récupérer le client via Feign
        ClientDTO client = userServiceClient.getClientById(request.getClientId());
        if (client == null) {
            throw new RuntimeException("Client non trouvé avec l'ID: " + request.getClientId());}
        // 2. Récupérer le produit via Feign
        ProduitDTO produitDTO = produitServiceClient.getProduitById(request.getProduitId());
        if (produitDTO == null) {
            throw new RuntimeException("Produit non trouvé avec l'ID: " + request.getProduitId());}
        // 2.bis Récupérer le pack si présent
        PackDTO packDTO = null;
        if (request.getPackId() != null && !request.getPackId().isEmpty()) {
            packDTO = packServiceClient.getPackById(request.getPackId());}
        // 3. Vérifier l'éligibilité
        verifierEligibilite(client, produitDTO);
        // 4. Calculer les dates
        Date dateDebut = request.getDateDebut() != null ? request.getDateDebut() : new Date();
        int dureeMois = request.getDureeMois() > 0 ? request.getDureeMois() : 12;
        Date dateFin = new Date(dateDebut.getTime() + (long) dureeMois * 30L * 24 * 60 * 60 * 1000);
        // 5. Calculer la prime
        double prime = request.getPrimePersonnalisee() > 0 ? request.getPrimePersonnalisee() : produitDTO.getPrixBase();
        // 6. Créer le contrat enrichi avec snapshot
        Contrat contrat = new Contrat();
        // Snapshot client
        contrat.setClientId(client.getIdUser());
        contrat.setClientNom(client.getUserName());
        contrat.setClientEmail(client.getEmail());
        contrat.setClientPhone(client.getPhone());
        contrat.setClientAge(client.getAge());
        contrat.setClientSexe(client.getSexe());
        contrat.setClientProfession(client.getProfession());
        contrat.setClientSituationFamiliale(client.getSituationFamiliale());
        // Snapshot produit
        contrat.setProduitId(produitDTO.getIdProduit());
        contrat.setProduitNom(produitDTO.getNomProduit());
        contrat.setProduitDescription(produitDTO.getDescription());
        contrat.setProduitPrixBase(produitDTO.getPrixBase());
        contrat.setProduitGarantiesIds(produitDTO.getGarantiesIds());
        // Snapshot pack
        if (packDTO != null) {
            contrat.setPackId(packDTO.getIdPack());
            contrat.setPackNom(packDTO.getNomPack());}
        // Détails contrat
        contrat.setDateDebut(dateDebut);
        contrat.setDateFin(dateFin);
        contrat.setDureeMois(dureeMois);
        contrat.setPrimeTotale(prime);
        contrat.setStatut("ACTIF");
        contrat.setDateCreation(new Date());
        contrat.setOptionsSupplementaires(request.getOptionsSupplementaires());
        return contratRepository.save(contrat);}
     // Vérifie que le client est éligible pour le produit choisi.
    private void verifierEligibilite(ClientDTO client, ProduitDTO produit) {
        // Vérifier l'âge
        Integer age = client.getAge();
        if (age == null) {
            throw new RuntimeException("L'âge du client est requis pour vérifier l'éligibilité");}
        if (age < produit.getAgeMin() || age > produit.getAgeMax()) {
            throw new RuntimeException("Le client n'est pas dans la tranche d'âge autorisée pour ce produit ("
                    + produit.getAgeMin() + "-" + produit.getAgeMax() + " ans)");}
        // Vérifier maladie chronique
        boolean aMaladie = client.isMaladieChronique();
        if (aMaladie && !produit.isMaladieChroniqueAutorisee()) {
            throw new RuntimeException("Ce produit n'accepte pas les clients avec maladie chronique");}
        // Vérifier diabète
        boolean estDiabetique = client.isDiabetique();
        if (estDiabetique && !produit.isDiabetiqueAutorise()) {
            throw new RuntimeException("Ce produit n'accepte pas les clients diabétiques");}
        // Vérifier que le produit est actif
        if (!produit.isActif()) {throw new RuntimeException("Le produit sélectionné n'est plus actif");}
    }
}