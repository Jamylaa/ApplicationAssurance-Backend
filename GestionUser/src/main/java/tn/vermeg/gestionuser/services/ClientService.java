package tn.vermeg.gestionuser.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.vermeg.gestionuser.dto.ClientDTO;
import tn.vermeg.gestionuser.dto.ClientResponseDTO;
import tn.vermeg.gestionuser.dto.ValidationResult;
import tn.vermeg.gestionuser.entities.Client;
import tn.vermeg.gestionuser.mapper.ClientMapper;
import tn.vermeg.gestionuser.repositories.ClientRepository;
import tn.vermeg.gestionuser.security.PasswordService;
import tn.vermeg.gestionuser.validation.UserValidator;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;
    private final MailService mailService;
    private final PasswordService passwordService;

    public ClientService(ClientRepository clientRepository, ClientMapper clientMapper, 
                        MailService mailService, PasswordService passwordService) {
        this.clientRepository = clientRepository;
        this.clientMapper = clientMapper;
        this.mailService = mailService;
        this.passwordService = passwordService;
    }

    public List<ClientResponseDTO> getAllClients() {
        return clientRepository.findAll().stream()
                .map(clientMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public ClientResponseDTO getClientById(String idUser) {
        Client client = clientRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        return clientMapper.toResponseDto(client);
    }

    @Transactional
    public ClientResponseDTO createClient(ClientDTO clientDTO) {
        // Valider les données
        validateClientData(clientDTO, true);
        
        // Vérifier les doublons
        checkForDuplicates(clientDTO, null);
        
        // Conversion et hashage du mot de passe
        Client client = clientMapper.toEntity(clientDTO);
        client.setPassword(passwordService.hashPassword(clientDTO.getPassword()));
        
        Client savedClient = clientRepository.save(client);
        
        // Envoyer l'email de bienvenue (sans le mot de passe)
        sendWelcomeEmail(savedClient);
        
        return clientMapper.toResponseDto(savedClient);
    }

    @Transactional
    public ClientResponseDTO updateClient(String idUser, ClientDTO clientDTO) {
        // Valider les données
        validateClientData(clientDTO, false);
        
        Client existingClient = clientRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        
        // Vérifier les doublons (en excluant le client actuel)
        checkForDuplicates(clientDTO, idUser);
        
        // Mise à jour des champs
        clientMapper.updateEntityFromDto(clientDTO, existingClient);
        
        // Hasher le nouveau mot de passe si fourni
        if (clientDTO.getPassword() != null && !clientDTO.getPassword().trim().isEmpty()) {
            existingClient.setPassword(passwordService.hashPassword(clientDTO.getPassword()));
        }
        
        Client updatedClient = clientRepository.save(existingClient);
        
        // Envoyer l'email de mise à jour
        sendUpdateEmail(updatedClient);
        
        return clientMapper.toResponseDto(updatedClient);
    }

    @Transactional
    public void deleteClient(String idUser) {
        Client client = clientRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        
        clientRepository.delete(client);
        
        // Envoyer l'email de suppression
        sendDeletionEmail(client);
    }

    public ValidationResult validateUsername(String username) {
        String error = UserValidator.validateUsername(username);
        if (error != null) {
            return new ValidationResult(false, error);
        }
        
        // Vérifier si le username est déjà utilisé
        Client existingClient = clientRepository.findByUserName(username);
        if (existingClient != null) {
            return new ValidationResult(false, "Ce username est déjà utilisé");
        }
        
        return new ValidationResult(true, "Username valide et disponible");
    }

    public ValidationResult validateEmail(String email) {
        String error = UserValidator.validateEmail(email);
        if (error != null) {
            return new ValidationResult(false, error);
        }
        
        // Vérifier si l'email est déjà utilisé
        Client existingClient = clientRepository.findByEmail(email).orElse(null);
        if (existingClient != null) {
            return new ValidationResult(false, "Cet email est déjà utilisé");
        }
        
        return new ValidationResult(true, "Email valide et disponible");
    }

    public List<ClientResponseDTO> searchClients(String query) {
        return clientRepository.findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query)
                .stream()
                .map(clientMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    private void validateClientData(ClientDTO clientDTO, boolean isCreation) {
        // Validation du username
        String usernameError = UserValidator.validateUsername(clientDTO.getUserName());
        if (usernameError != null) {
            throw new IllegalArgumentException("Username invalide: " + usernameError);
        }
        
        // Validation du mot de passe (uniquement en création ou si modifié)
        if (isCreation || (clientDTO.getPassword() != null && !clientDTO.getPassword().trim().isEmpty())) {
            String passwordError = UserValidator.validatePassword(clientDTO.getPassword());
            if (passwordError != null) {
                throw new IllegalArgumentException("Mot de passe invalide: " + passwordError);
            }
        }
        
        // Validation de l'email
        String emailError = UserValidator.validateEmail(clientDTO.getEmail());
        if (emailError != null) {
            throw new IllegalArgumentException("Email invalide: " + emailError);
        }
        
        // Validation du téléphone
        String phoneError = UserValidator.validatePhone(clientDTO.getPhone());
        if (phoneError != null) {
            throw new IllegalArgumentException("Téléphone invalide: " + phoneError);
        }
    }

    private void checkForDuplicates(ClientDTO clientDTO, String excludeId) {
        // Vérifier l'email
        Client existingEmailClient = clientRepository.findByEmail(clientDTO.getEmail()).orElse(null);
        if (existingEmailClient != null && !existingEmailClient.getIdUser().equals(excludeId)) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }
        
        // Vérifier le username
        Client existingUsernameClient = clientRepository.findByUserName(clientDTO.getUserName());
        if (existingUsernameClient != null && !existingUsernameClient.getIdUser().equals(excludeId)) {
            throw new RuntimeException("Ce username est déjà utilisé");
        }
    }

    private void sendWelcomeEmail(Client client) {
        String subject = "Bienvenue sur notre plateforme";
        String body = "Bonjour " + client.getUserName() + ",\n\n" +
                "Votre compte client a été créé avec succès.\n\n" +
                "Vos coordonnées :\n" +
                "ID: " + client.getIdUser() + "\n" +
                "Nom: " + client.getUserName() + "\n" +
                "Email: " + client.getEmail() + "\n" +
                "Téléphone: " + client.getPhone() + "\n\n" +
                "Votre mot de passe a été sécurisé et n'est pas inclus dans cet email pour des raisons de sécurité.\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        
        mailService.sendEmail(client.getEmail(), subject, body);
    }

    private void sendUpdateEmail(Client client) {
        String subject = "Mise à jour de votre compte";
        String body = "Bonjour " + client.getUserName() + ",\n\n" +
                "Votre compte a été mis à jour avec succès.\n\n" +
                "Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        
        mailService.sendEmail(client.getEmail(), subject, body);
    }

    private void sendDeletionEmail(Client client) {
        String subject = "Suppression de votre compte";
        String body = "Bonjour " + client.getUserName() + ",\n\n" +
                "Votre compte client a été supprimé conformément à votre demande.\n\n" +
                "Si vous n'êtes pas à l'origine de cette suppression, veuillez nous contacter immédiatement.\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        
        mailService.sendEmail(client.getEmail(), subject, body);
    }
}
