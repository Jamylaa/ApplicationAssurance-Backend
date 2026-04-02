package tn.vermeg.gestionuser.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.vermeg.gestionuser.entities.Agent;
import tn.vermeg.gestionuser.repositories.AgentRepository;
import tn.vermeg.gestionuser.security.PasswordService;

import java.util.List;

@Service
@Transactional
public class AgentService {
    private final AgentRepository agentRepository;
    private final MailService mailService;
    private final PasswordService passwordService;
    
    public AgentService(AgentRepository agentRepository, MailService mailService, PasswordService passwordService) {
        this.agentRepository = agentRepository;
        this.mailService = mailService;
        this.passwordService = passwordService;
    }

    public List<Agent> getAllAgents() {
        return agentRepository.findAll();
    }

    public Agent getAgentById(String idUser) {
        return agentRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
    }

    @Transactional
    public Agent createAgent(Agent agent) {
        // Sauvegarder le mot de passe original pour l'email
        String originalPassword = agent.getPassword();
        // Hashage du mot de passe
        agent.setPassword(passwordService.hashPassword(agent.getPassword()));
        Agent savedAgent = agentRepository.save(agent);
        // Envoyer l'email de bienvenue avec le mot de passe original
        sendWelcomeEmail(savedAgent, originalPassword);
        return savedAgent;
    }

    @Transactional
    public Agent updateAgent(String idUser, Agent agent) {
        Agent existingAgent = agentRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        
        // Sauvegarder le mot de passe pour l'email
        String passwordForEmail = null;
        if (agent.getPassword() != null && !agent.getPassword().trim().isEmpty()) {
            passwordForEmail = agent.getPassword();
        }
        
        // Mise à jour des champs
        existingAgent.setUserName(agent.getUserName());
        existingAgent.setEmail(agent.getEmail());
        existingAgent.setPhone(agent.getPhone());
        existingAgent.setService(agent.getService());
        existingAgent.setGrade(agent.getGrade());
        existingAgent.setSexe(agent.getSexe());
        existingAgent.setAge(agent.getAge());
        
        // Hasher le nouveau mot de passe si fourni
        if (agent.getPassword() != null && !agent.getPassword().trim().isEmpty()) {
            existingAgent.setPassword(passwordService.hashPassword(agent.getPassword()));
        }
        
        Agent updatedAgent = agentRepository.save(existingAgent);
        // Envoyer l'email de mise à jour avec le mot de passe
        sendUpdateEmail(updatedAgent, passwordForEmail);
        return updatedAgent;
    }

    @Transactional
    public void deleteAgent(String idUser) {
        Agent agent = agentRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
        
        agentRepository.delete(agent);
        // Envoyer l'email de suppression
        sendDeletionEmail(agent);
    }

    private void sendWelcomeEmail(Agent agent, String originalPassword) {
        String subject = "VOS COORDONNÉES DE CONNEXION - Compte Agent";
        String body = "Bonjour " + agent.getUserName() + ",\n\n" +
                "Votre compte agent a été créé avec succès.\n\n" +
              //  "=== VOS COORDONNÉES DE CONNEXION ===\n" +
                "Type de compte : AGENT\n" +
                "Nom d'utilisateur : " + agent.getUserName() + "\n" +
                "Email : " + agent.getEmail() + "\n" +
                "Téléphone : " + agent.getPhone() + "\n" +
                "Mot de passe : " + originalPassword + "\n\n" +
            //    "=== VOS INFORMATIONS PROFESSIONNELLES ===\n" +
                "Service : " + (agent.getService() != null ? agent.getService() : "Non spécifié") + "\n" +
                "Grade : " + (agent.getGrade() != null ? agent.getGrade() : "Non spécifié") + "\n" +
//                "Sexe : " + (agent.getSexe() != null ? agent.getSexe() : "Non spécifié") + "\n" +
//                "Âge : " + (agent.getAge() != null ? agent.getAge() : "Non spécifié") + "\n\n" +
//                "=== INSTRUCTIONS DE CONNEXION ===\n" +
                "1. Connectez-vous avec votre nom d'utilisateur et mot de passe\n" +
                "2. Gardez ces informations confidentielles\n" +
                "3. Changez votre mot de passe lors de la première connexion\n" +
                "4. Vous avez accès aux fonctionnalités d'agent\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        mailService.sendEmail(agent.getEmail(), subject, body);
    }

    private void sendUpdateEmail(Agent agent, String passwordForEmail) {
        String subject = "MISE À JOUR - Vos coordonnées Agent";
        String body = "Bonjour " + agent.getUserName() + ",\n\n" +
                "Votre compte agent a été mis à jour avec succès.\n\n" +
              //  "=== VOS COORDONNÉES ACTUELLES ===\n" +
                "Type de compte : AGENT\n" +
                "Nom d'utilisateur : " + agent.getUserName() + "\n" +
                "Email : " + agent.getEmail() + "\n" +
                "Téléphone : " + agent.getPhone() + "\n" +
                (passwordForEmail != null ? "Mot de passe : " + passwordForEmail + "\n" : "Mot de passe : Inchangé\n") +
             //   "\n=== VOS INFORMATIONS PROFESSIONNELLES ===\n" +
                "Service : " + (agent.getService() != null ? agent.getService() : "Non spécifié") + "\n" +
                "Grade : " + (agent.getGrade() != null ? agent.getGrade() : "Non spécifié") + "\n" +
//                "Sexe : " + (agent.getSexe() != null ? agent.getSexe() : "Non spécifié") + "\n" +
//                "Âge : " + (agent.getAge() != null ? agent.getAge() : "Non spécifié") + "\n\n" +
                "Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        mailService.sendEmail(agent.getEmail(), subject, body);
    }

    private void sendDeletionEmail(Agent agent) {
        String subject = "SUPPRESSION - Compte Agent Vermeg";
        String body = "Bonjour " + agent.getUserName() + ",\n\n" +
                "Votre compte agent a été supprimé avec succès.\n\n" +
              //  "=== COORDONNÉES DU COMPTE SUPPRIMÉ ===\n" +
                "Type de compte : AGENT\n" +
                "Nom d'utilisateur : " + agent.getUserName() + "\n" +
                "Email : " + agent.getEmail() + "\n" +
                "Téléphone : " + agent.getPhone() + "\n" +
                "Mot de passe : [Non disponible - compte supprimé]\n\n" +
              //  "=== INFORMATIONS PROFESSIONNELLES ===\n" +
                "Service : " + (agent.getService() != null ? agent.getService() : "Non spécifié") + "\n" +
                "Grade : " + (agent.getGrade() != null ? agent.getGrade() : "Non spécifié") + "\n" +
//                "Sexe : " + (agent.getSexe() != null ? agent.getSexe() : "Non spécifié") + "\n" +
//                "Âge : " + (agent.getAge() != null ? agent.getAge() : "Non spécifié") + "\n\n" +
                "Si vous n'êtes pas à l'origine de cette suppression, veuillez nous contacter immédiatement.\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        
        mailService.sendEmail(agent.getEmail(), subject, body);
    }
}
