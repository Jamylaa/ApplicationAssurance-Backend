package tn.vermeg.gestionuser.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.vermeg.gestionuser.entities.Admin;
import tn.vermeg.gestionuser.entities.Departement;
import tn.vermeg.gestionuser.repositories.AdminRepository;
import tn.vermeg.gestionuser.security.PasswordService;

import java.util.List;

@Service
public class AdminService {
    private final AdminRepository adminRepository;
    private final MailService mailService;
    private final PasswordService passwordService;
    
    public AdminService(AdminRepository adminRepository, MailService mailService, PasswordService passwordService) {
        this.adminRepository = adminRepository;
        this.mailService = mailService;
        this.passwordService = passwordService;}

    // Création d'un admin
   // create Admin+ envoi par mail
    public Admin createAdmin(Admin admin) {
        // Sauvegarder le mot de passe original pour l'email
        String originalPassword = admin.getPassword();
        // Hasher le mot de passe avant de sauvegarder
        admin.setPassword(passwordService.hashPassword(admin.getPassword()));
        Admin savedAdmin = adminRepository.save(admin);
        // Envoyer l'email avec toutes les coordonnées
        sendWelcomeEmail(savedAdmin, originalPassword);
        return savedAdmin;
    }

    // Récupération de tous les admins
    public List<Admin> getAllAdmins() {return adminRepository.findAll();}
    // Récupération par ID
    public Admin getAdminById(String idUser) {
        return adminRepository.findById(idUser).orElseThrow(() -> new RuntimeException("Admin not found"));}

    // Mise à jour d'un admin
    public Admin updateAdmin(String idUser, Admin updatedAdmin) {
        Admin admin = getAdminById(idUser);
        
        // Sauvegarder le mot de passe pour l'email
        String passwordForEmail = null;
        if (updatedAdmin.getPassword() != null && !updatedAdmin.getPassword().trim().isEmpty()) {
            passwordForEmail = updatedAdmin.getPassword();
        }
        
        admin.setUserName(updatedAdmin.getUserName());
        admin.setEmail(updatedAdmin.getEmail());
        admin.setPassword(updatedAdmin.getPassword());
        admin.setPhone(updatedAdmin.getPhone());
        //admin.setDepartment(updatedAdmin.getDepartment());
        //admin.setActive(updatedAdmin.getActive());
        Admin savedAdmin = adminRepository.save(admin);

        // Envoyer l'email de mise à jour avec le mot de passe
        sendUpdateEmail(savedAdmin, passwordForEmail);
        return savedAdmin;
    }
    // Suppression
    public void deleteAdmin(String idUser) {
        Admin admin = getAdminById(idUser);
        adminRepository.delete(admin);
        // Envoyer l'email de suppression
        sendDeletionEmail(admin);
    }

    private void sendWelcomeEmail(Admin admin, String originalPassword) {
        String subject = "VOS COORDONNÉES DE CONNEXION - Compte Administrateur";
        String body = "Bonjour " + admin.getUserName() + ",\n\n" +
                "Votre compte administrateur a été créé avec succès.\n\n" +
              //  "=== VOS COORDONNÉES DE CONNEXION ===\n" +
                "Type de compte : ADMINISTRATEUR\n" +
                "Nom d'utilisateur : " + admin.getUserName() + "\n" +
                "Email : " + admin.getEmail() + "\n" +
                "Téléphone : " + admin.getPhone() + "\n" +
                "Mot de passe : " + originalPassword + "\n\n" +
            //    "=== VOS INFORMATIONS PROFESSIONNELLES ===\n" +
                "Département : " + (admin.getDepartement() != null ? admin.getDepartement().toString() : "Non spécifié") + "\n\n" +
              //  "=== INSTRUCTIONS DE CONNEXION ===\n" +
                "1. Connectez-vous avec votre nom d'utilisateur et mot de passe\n" +
                "2. Gardez ces informations confidentielles\n" +
                "3. Changez votre mot de passe lors de la première connexion\n" +
                "4. Vous avez accès aux fonctionnalités d'administration\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        
        mailService.sendEmail(admin.getEmail(), subject, body);
    }

    private void sendUpdateEmail(Admin admin, String passwordForEmail) {
        String subject = "MISE À JOUR - Vos coordonnées Administrateur";
        String body = "Bonjour " + admin.getUserName() + ",\n\n" +
                "Votre compte administrateur a été mis à jour avec succès.\n\n" +
             //   "=== VOS COORDONNÉES ACTUELLES ===\n" +
                "Type de compte : ADMINISTRATEUR\n" +
                "Nom d'utilisateur : " + admin.getUserName() + "\n" +
                "Email : " + admin.getEmail() + "\n" +
                "Mot de passe : " + admin.getPassword() + "\n\n" +
                "Téléphone : " + admin.getPhone() + "\n" +
                (passwordForEmail != null ? "Mot de passe : " + passwordForEmail + "\n" : "Mot de passe : Inchangé\n") +
           //     "\n=== VOS INFORMATIONS PROFESSIONNELLES ===\n" +
                "Département : " + (admin.getDepartement() != null ? admin.getDepartement().toString() : "Non spécifié") + "\n\n" +
                "Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        
        mailService.sendEmail(admin.getEmail(), subject, body);
    }

    private void sendDeletionEmail(Admin admin) {
        String subject = "SUPPRESSION - Compte Administrateur Vermeg";
        String body = "Bonjour " + admin.getUserName() + ",\n\n" +
                "Votre compte administrateur a été supprimé avec succès.\n\n" +
              //  "=== COORDONNÉES DU COMPTE SUPPRIMÉ ===\n" +
                "Type de compte : ADMINISTRATEUR\n" +
                "Nom d'utilisateur : " + admin.getUserName() + "\n" +
                "Email : " + admin.getEmail() + "\n" +
                "Téléphone : " + admin.getPhone() + "\n" +
                "Mot de passe : [Non disponible - compte supprimé]\n\n" +
            //    "=== INFORMATIONS PROFESSIONNELLES ===\n" +
                "Département : " + (admin.getDepartement() != null ? admin.getDepartement().toString() : "Non spécifié") + "\n\n" +
                "Si vous n'êtes pas à l'origine de cette suppression, veuillez nous contacter immédiatement.\n\n" +
                "Cordialement,\nL'équipe Vermeg.";
        
        mailService.sendEmail(admin.getEmail(), subject, body);
    }
}
