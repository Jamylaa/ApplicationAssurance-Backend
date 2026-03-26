package tn.vermeg.gestionuser.services;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
            System.out.println("Email envoyé avec succès à " + to);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'email : " + e.getMessage());
        }}
    public void sendCredentials(String to, String username, String password) {
        String subject = "Vos identifiants de connexion - Assurance Vermeg";
        String text = "Bonjour,\n\n" +
                "Votre compte a été créé par l'administrateur.\n" +
                "Voici vos identifiants :\n" +
                "Nom d'utilisateur : " + username + "\n" +
                "Mot de passe : " + password + "\n\n" +
                "Cordialement,\n" +
                "L'équipe Vermeg.";
        sendEmail(to, subject, text);
    }
}