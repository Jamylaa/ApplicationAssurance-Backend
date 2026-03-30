package tn.vermeg.gestionuser.validation;
import java.util.regex.Pattern;

public class UserValidator {
    
    // Pattern pour username: un seul mot ou mots séparés par des tirets uniquement
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z]+(-[a-zA-Z]+)*$");
    // Pattern pour mot de passe: minimum 6 caractères
    private static final int MIN_PASSWORD_LENGTH = 6;
    /**
     * Valide le format du username
     * @param username Le username à valider
     * @return message d'erreur si invalide, null si valide
     */
    public static String validateUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return "Le username ne peut pas être vide";}
        String trimmedUsername = username.trim();
        // Vérifier la longueur
        if (trimmedUsername.length() < 3) {
            return "Le username doit contenir au moins 3 caractères";}
        if (trimmedUsername.length() > 30) {
            return "Le username ne peut pas dépasser 30 caractères";}
        // Vérifier le format (un seul mot ou mots séparés par des tirets)
        if (!USERNAME_PATTERN.matcher(trimmedUsername).matches()) {
            return "Le username doit être un seul mot ou des mots séparés uniquement par des tirets (ex: jean, jean-marc)";}
        return null; // Valide
         }
    /**
     * Valide le format du mot de passe
     * @param password Le mot de passe à valider
     * @return message d'erreur si invalide, null si valide
     */
    public static String validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            return "Le mot de passe ne peut pas être vide";}
        
        // Vérifier la longueur minimale
        if (password.length() < MIN_PASSWORD_LENGTH) {
            return "Le mot de passe doit contenir au moins " + MIN_PASSWORD_LENGTH + " caractères";}
        // Vérifier qu'il ne contient pas d'espaces
        if (password.contains(" ")) {
            return "Le mot de passe ne peut pas contenir d'espaces";}
        // Validation supplémentaire (optionnelle)
        if (!password.matches(".*[a-zA-Z].*")) {
            return "Le mot de passe doit contenir au moins une lettre";}
        if (!password.matches(".*[0-9].*")) {
            return "Le mot de passe doit contenir au moins un chiffre";}
        return null; // Valide
    }
    
    /**
     * Valide le format de l'email
     * @param email L'email à valider
     * @return message d'erreur si invalide, null si valide
     */
    public static String validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return "L'email ne peut pas être vide";}
        String trimmedEmail = email.trim();
        // Pattern email simple
        if (!trimmedEmail.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return "L'email n'a pas un format valide";}
        return null; // Valide
    }
    /**
     * Valide le numéro de téléphone
     * @param phone Le numéro de téléphone à valider
     * @return message d'erreur si invalide, null si valide
     */
    public static String validatePhone(Integer phone) {
        if (phone == null) {
            return "Le numéro de téléphone ne peut pas être vide";}
        String phoneStr = phone.toString();
        // Vérifier que c'est un nombre positif
        if (phone < 0) {
            return "Le numéro de téléphone doit être positif";}
        // Vérifier la longueur (pour Tunisie: 8 chiffres)
        if (phoneStr.length() != 8) {
            return "Le numéro de téléphone doit contenir 8 chiffres";}
        // Vérifier qu'il commence par les bons préfixes tunisiens
        if (!phoneStr.matches("^[2-9]\\d{7}$")) {
            return "Le numéro de téléphone doit commencer par 2, 3, 4, 5, 6, 7, 8 ou 9";}
        return null; // Valide
    }
}
