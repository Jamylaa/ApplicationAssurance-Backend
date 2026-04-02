package tn.vermeg.gestionuser.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.vermeg.gestionuser.dto.ValidationResult;
import tn.vermeg.gestionuser.entities.Client;
import tn.vermeg.gestionuser.repositories.ClientRepository;
import tn.vermeg.gestionuser.security.PasswordService;
import tn.vermeg.gestionuser.validation.UserValidator;
import java.util.List;
@Service
@Transactional
public class ClientService {
    private final ClientRepository clientRepository;
//    private final ClientMapper clientMapper;
    private final MailService mailService;
    private final PasswordService passwordService;

    public ClientService(ClientRepository clientRepository,
                        MailService mailService, PasswordService passwordService) {
        this.clientRepository = clientRepository;
       // this.clientMapper = clientMapper;
        this.mailService = mailService;
        this.passwordService = passwordService;}

    public List<Client> getAllClients() {return clientRepository.findAll();}
    public Client getClientById(String idUser) {
        return clientRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));}

    @Transactional
    public Client createClient(Client client) {
        // Valider les données
        validateClientData(client, true);
        // Vérifier les doublons
        checkForDuplicates(client, null);
        // Sauvegarder le mot de passe original pour l'email
        String originalPassword = client.getPassword();
        // Hashage du mot de passe
        client.setPassword(passwordService.hashPassword(client.getPassword()));
        Client savedClient = clientRepository.save(client);
        // Envoyer l'email de bienvenue avec le mot de passe original
        sendWelcomeEmail(savedClient, originalPassword);
        return savedClient;}

    @Transactional
    public Client updateClient(String idUser, Client client) {
        // Valider les données
        validateClientData(client, false);
        Client existingClient = clientRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        // Vérifier les doublons (en excluant le client actuel)
        checkForDuplicates(client, idUser);
        
        // Sauvegarder le mot de passe pour l'email
        String passwordForEmail = null;
        if (client.getPassword() != null && !client.getPassword().trim().isEmpty()) {
            passwordForEmail = client.getPassword();
        }
        // Mise à jour des champs
        existingClient.setUserName(client.getUserName());
        existingClient.setEmail(client.getEmail());
        existingClient.setPhone(client.getPhone());
        existingClient.setAge(client.getAge());
        existingClient.setSexe(client.getSexe());
        existingClient.setProfession(client.getProfession());
        existingClient.setSituationFamiliale(client.getSituationFamiliale());
        existingClient.setMaladieChronique(client.isMaladieChronique());
        existingClient.setDiabetique(client.isDiabetique());
        existingClient.setTension(client.isTension());
        existingClient.setNombreBeneficiaires(client.getNombreBeneficiaires());
        // Hasher le nouveau mot de passe si fourni
        if (client.getPassword() != null && !client.getPassword().trim().isEmpty()) {
            existingClient.setPassword(passwordService.hashPassword(client.getPassword()));}
        Client updatedClient = clientRepository.save(existingClient);
        // Envoyer l'email de mise à jour avec le mot de passe
        sendUpdateEmail(updatedClient, passwordForEmail);
        return updatedClient;}
    @Transactional
    public void deleteClient(String idUser) {
        Client client = clientRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        clientRepository.delete(client);
        // Envoyer l'email de suppression
        sendDeletionEmail(client);}

    public ValidationResult validateUsername(String username) {
        String error = UserValidator.validateUsername(username);
        if (error != null) {
            return new ValidationResult(false, error);}
        
        // Vérifier si le username est déjà utilisé
        Client existingClient = clientRepository.findByUserName(username);
        if (existingClient != null) {
            return new ValidationResult(false, "Ce username est déjà utilisé");}
        return new ValidationResult(true, "Username valide");}

    public ValidationResult validateEmail(String email) {
        String error = UserValidator.validateEmail(email);
        if (error != null) {
            return new ValidationResult(false, error);}
        
        // Plus de vérification d'unicité - les emails peuvent être dupliqués
        return new ValidationResult(true, "Email valide");}

    public List<Client> searchClients(String query) {
        return clientRepository.findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);}

    private void validateClientData(Client client, boolean isCreation) {
        // Validation du username
        if (client.getUserName() == null || client.getUserName().trim().isEmpty()) {
            throw new IllegalArgumentException("Le username ne peut pas être vide");
        }
        if (!client.getUserName().matches("^[a-zA-Z]+(-[a-zA-Z]+)*$")) {
            throw new IllegalArgumentException("Le username doit être un seul mot ou des mots séparés uniquement par des tirets (ex: jean, jean-marc)");
        }
        if (client.getUserName().length() < 3 || client.getUserName().length() > 30) {
            throw new IllegalArgumentException("Le username doit contenir entre 3 et 30 caractères");
        }
        
        // Validation du mot de passe (uniquement en création ou si modifié)
        if (isCreation || (client.getPassword() != null && !client.getPassword().trim().isEmpty())) {
            if (client.getPassword() == null || client.getPassword().length() < 6) {
                throw new IllegalArgumentException("Le mot de passe doit contenir au moins 6 caractères");
            }
            if (!client.getPassword().matches("^(?=.*[a-zA-Z])(?=.*[0-9]).+$")) {
                throw new IllegalArgumentException("Le mot de passe doit contenir au moins une lettre et un chiffre");}
        }
        // Validation de l'email
        if (client.getEmail() == null || client.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("L'email ne peut pas être vide");}
        if (!client.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("L'email doit avoir un format valide");}
        
        // Validation du téléphone
        if (client.getPhone() == null) {
            throw new IllegalArgumentException("Le téléphone ne peut pas être vide");}
        if (client.getPhone() < 20000000 || client.getPhone() > 99999999) {
            throw new IllegalArgumentException("Le numéro de téléphone doit être valide");}
        // Validation de l'âge
        if (client.getAge() != null && (client.getAge() < 0 || client.getAge() > 150)) {
            throw new IllegalArgumentException("L'âge doit être entre 0 et 150 ans");}
        
        // Validation du sexe
        if (client.getSexe() != null && !client.getSexe().matches("^(M|F|Homme|Femme)$")) {
            throw new IllegalArgumentException("Le sexe doit être M, F, Homme ou Femme");}
        
        // Validation du nombre de bénéficiaires
        if (client.getNombreBeneficiaires() != null && client.getNombreBeneficiaires() < 1) {
            throw new IllegalArgumentException("Le nombre de bénéficiaires doit être au moins 1");}
    }

    private void checkForDuplicates(Client client, String excludeId) {
        // Vérifier uniquement le username (l'email peut être dupliqué)
        Client existingUsernameClient = clientRepository.findByUserName(client.getUserName());
        if (existingUsernameClient != null && !existingUsernameClient.getIdUser().equals(excludeId)) {
            throw new RuntimeException("Ce username est déjà utilisé");}}

    private void sendWelcomeEmail(Client client, String originalPassword) {
        String subject = "VOS COORDONNÉES DE CONNEXION - Compte Client";
        String body = "Bonjour " + client.getUserName() + ",\n\n" +
                "Votre compte client a été créé avec succès.\n\n" +
             //   "=== VOS COORDONNÉES DE CONNEXION ===\n" +
                "Type de compte : CLIENT\n" +
                "Nom d'utilisateur : " + client.getUserName() + "\n" +
                "Email : " + client.getEmail() + "\n" +
                "Mot de passe : " + originalPassword + "\n\n" +
                "Téléphone : " + client.getPhone() + "\n" +
             //   "=== VOS INFORMATIONS PERSONNELLES ===\n" +
//                "Âge : " + (client.getAge() != null ? client.getAge() : "Non spécifié") + "\n" +
//                "Sexe : " + (client.getSexe() != null ? client.getSexe() : "Non spécifié") + "\n" +
//                "Profession : " + (client.getProfession() != null ? client.getProfession() : "Non spécifié") + "\n" +
//                "Situation familiale : " + (client.getSituationFamiliale() != null ? client.getSituationFamiliale() : "Non spécifié") + "\n" +
//                "Nombre de bénéficiaires : " + client.getNombreBeneficiaires() + "\n" +
//                "Maladie chronique : " + (client.isMaladieChronique() ? "Oui" : "Non") + "\n" +
//                "Diabétique : " + (client.isDiabetique() ? "Oui" : "Non") + "\n" +
//                "Tension : " + (client.isTension() ? "Oui" : "Non") + "\n\n" +
//                "=== INSTRUCTIONS DE CONNEXION ===\n" +
                "1. Connectez-vous avec votre nom d'utilisateur et mot de passe\n" +
                "2. Gardez ces informations confidentielles\n" +
                "3. Changez votre mot de passe lors de la première connexion\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        
        mailService.sendEmail(client.getEmail(), subject, body);
    }
    private void sendUpdateEmail(Client client, String passwordForEmail) {
        String subject = "MISE À JOUR - Vos coordonnées de connexion";
        String body = "Bonjour " + client.getUserName() + ",\n\n" +
                "Votre compte client a été mis à jour avec succès.\n\n" +
               // "=== VOS COORDONNÉES ACTUELLES ===\n" +
                "Type de compte : CLIENT\n" +
                "Nom d'utilisateur : " + client.getUserName() + "\n" +
                "Email : " + client.getEmail() + "\n" +
                "Téléphone : " + client.getPhone() + "\n" +
                (passwordForEmail != null ? "Mot de passe : " + passwordForEmail + "\n" : "Mot de passe : Inchangé\n") +
             //   "\n=== VOS INFORMATIONS PERSONNELLES ===\n" +
//                "Âge : " + (client.getAge() != null ? client.getAge() : "Non spécifié") + "\n" +
//                "Sexe : " + (client.getSexe() != null ? client.getSexe() : "Non spécifié") + "\n" +
//                "Profession : " + (client.getProfession() != null ? client.getProfession() : "Non spécifié") + "\n" +
//                "Situation familiale : " + (client.getSituationFamiliale() != null ? client.getSituationFamiliale() : "Non spécifié") + "\n" +
//                "Nombre de bénéficiaires : " + client.getNombreBeneficiaires() + "\n" +
//                "Maladie chronique : " + (client.isMaladieChronique() ? "Oui" : "Non") + "\n" +
//                "Diabétique : " + (client.isDiabetique() ? "Oui" : "Non") + "\n" +
//                "Tension : " + (client.isTension() ? "Oui" : "Non") + "\n\n" +
                "Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        
        mailService.sendEmail(client.getEmail(), subject, body);
    }

    private void sendDeletionEmail(Client client) {
        String subject = "SUPPRESSION - Compte Client Vermeg";
        String body = "Bonjour " + client.getUserName() + ",\n\n" +
                "Votre compte client a été supprimé avec succès.\n\n" +
              //  "=== COORDONNÉES DU COMPTE SUPPRIMÉ ===\n" +
                "Type de compte : CLIENT\n" +
                "Nom d'utilisateur : " + client.getUserName() + "\n" +
                "Email : " + client.getEmail() + "\n" +
                "Mot de passe : [Non disponible - compte supprimé]\n\n" +
                "Téléphone : " + client.getPhone() + "\n" +
//                "=== INFORMATIONS PERSONNELLES ===\n" +
//                "Âge : " + (client.getAge() != null ? client.getAge() : "Non spécifié") + "\n" +
//                "Sexe : " + (client.getSexe() != null ? client.getSexe() : "Non spécifié") + "\n" +
//                "Profession : " + (client.getProfession() != null ? client.getProfession() : "Non spécifié") + "\n" +
//                "Situation familiale : " + (client.getSituationFamiliale() != null ? client.getSituationFamiliale() : "Non spécifié") + "\n" +
              //  "Nombre de bénéficiaires : " + client.getNombreBeneficiaires() + "\n\n" +
                "Si vous n'êtes pas à l'origine de cette suppression, veuillez nous contacter immédiatement.\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        
        mailService.sendEmail(client.getEmail(), subject, body);
    }
}