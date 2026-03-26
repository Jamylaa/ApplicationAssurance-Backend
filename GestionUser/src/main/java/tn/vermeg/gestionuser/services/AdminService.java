package tn.vermeg.gestionuser.services;

import org.springframework.stereotype.Service;
import tn.vermeg.gestionuser.entities.Admin;
import tn.vermeg.gestionuser.entities.Departement;
import tn.vermeg.gestionuser.repositories.AdminRepository;

import java.util.List;

@Service
public class AdminService {
    private final AdminRepository adminRepository;
    private final MailService mailService;
    public AdminService(AdminRepository adminRepository, MailService mailService) {
        this.adminRepository = adminRepository;
        this.mailService = mailService;}

    // Création d'un admin
   // create Admin+ envoi par mail
    public Admin createAdmin(Admin admin) {
        Admin savedAdmin = adminRepository.save(admin);
        //Envoi du mail après création
        String subject = "Bienvenue dans le système";
        String body = "Bonjour " + admin.getUserName() + ",\n\n" +
                "Votre compte admin a été créé avec succès.\n\n" +
                " Vos coordonnées :\n" +
                " ID: " + savedAdmin.getIdUser() + "\n\n" +
                " Nom: " + admin.getUserName() + "\n" +
                " Email: " + admin.getEmail() + "\n" +
                " Téléphone: " + admin.getPhone() + "\n" +
                " Département: " + admin.getDepartement() + "\n" +
                " Mot de passe: " + admin.getPassword() + "\n" +
                "Cordialement,\nL'équipe Vermeg.";
        mailService.sendEmail(admin.getEmail(), subject, body);
        return savedAdmin;
    }


    // Récupération de tous les admins
    public List<Admin> getAllAdmins() {return adminRepository.findAll();}

    // Récupération par ID
    public Admin getAdminById(String idUser) {
        return adminRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("Admin not found"));}

    // Mise à jour d'un admin
    public Admin updateAdmin(String idUser, Admin updatedAdmin) {
        Admin admin = getAdminById(idUser);


        admin.setUserName(updatedAdmin.getUserName());
        admin.setEmail(updatedAdmin.getEmail());
        admin.setPassword(updatedAdmin.getPassword());
        admin.setPhone(updatedAdmin.getPhone());
        //admin.setDepartment(updatedAdmin.getDepartment());
        //admin.setActive(updatedAdmin.getActive());
        Admin savedAdmin = adminRepository.save(admin);

        //Envoi du mail après modification
        String subject = "Mise à jour de votre compte Admin";
        String body = "Bonjour " + savedAdmin.getUserName() + ",\n\n" +
                "Votre compte admin a été mis à jour avec succès.\n\n" +
                "📋 Vos nouvelles coordonnées :\n" +
                "👤 Nom: " + savedAdmin.getUserName() + "\n" +
                "📧 Email: " + savedAdmin.getEmail() + "\n" +
                "📞 Téléphone: " + savedAdmin.getPhone() + "\n" +
                "🏢 Département: " + savedAdmin.getDepartement() + "\n" +
                "🔐 Mot de passe: " + savedAdmin.getPassword() + "\n" +
                "🆔 ID: " + savedAdmin.getIdUser() + "\n\n" +
                "Si vous n'êtes pas à l'origine de cette modification, veuillez contacter l'administrateur.\n\n" +
                "Cordialement,\nL'équipe.";


        mailService.sendEmail(admin.getEmail(), subject, body);
        return savedAdmin;
    }




    // Suppression
    public void deleteAdmin(String idUser) {Admin admin = getAdminById(idUser);
        adminRepository.delete(admin);
        String subject = "Suppression de votre compte Admin";
        String body = "Bonjour " + admin.getUserName() + ",\n\n" +
                "Votre compte admin a été supprimé conformément à votre demande.\n\n" +
                "📋 Coordonnées du compte supprimé :\n" +
                "👤 Nom: " + admin.getUserName() + "\n" +
                "📧 Email: " + admin.getEmail() + "\n" +
                "📞 Téléphone: " + admin.getPhone() + "\n" +
                "🏢 Département: " + admin.getDepartement() + "\n" +
                "🆔 ID: " + admin.getIdUser() + "\n\n" +
                "Si vous n'êtes pas à l'origine de cette suppression, veuillez nous contacter immédiatement.\n\n" +
                "Cordialement,\nL'équipe.";
        mailService.sendEmail(admin.getEmail(), subject, body);
    }
}