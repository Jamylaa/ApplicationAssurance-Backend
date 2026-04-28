package tn.vermeg.gestionuser.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionuser.dto.AuthRequest;
import tn.vermeg.gestionuser.dto.RegisterRequest;
import tn.vermeg.gestionuser.entities.User;
import tn.vermeg.gestionuser.repositories.UserRepository;
import tn.vermeg.gestionuser.utils.JwtUtil;

import java.util.Map;
import java.util.Optional;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
//        user.setRole("ROLE_USER");

        User saved = userRepository.save(user);
        saved.setPassword(null);

        return ResponseEntity.status(201).body(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getUsername());

        return ResponseEntity.ok(Map.of("token", token));
    }
}

//import jakarta.validation.Valid;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.web.bind.annotation.*;
//import tn.vermeg.gestionuser.dto.AuthRequest;
//import tn.vermeg.gestionuser.dto.RegisterRequest;
//import tn.vermeg.gestionuser.entities.User;
//import tn.vermeg.gestionuser.repositories.UserRepository;
//import tn.vermeg.gestionuser.services.MailService;
//import tn.vermeg.gestionuser.utils.JwtUtil;
//
//import java.util.Map;
//import java.util.Optional;
//
//@RestController
//@RequestMapping("/api/auth")
//@CrossOrigin(origins = "http://localhost:4200")
//public class AuthController {
//    private final PasswordEncoder passwordEncoder;
//    private final UserRepository userRepository;
//    private final JwtUtil jwtUtil;
//    private final MailService mailService;
//
//    public AuthController(PasswordEncoder passwordEncoder,
//                          UserRepository userRepository,
//                          JwtUtil jwtUtil,
//                          MailService mailService) {
//        this.passwordEncoder = passwordEncoder;
//        this.userRepository = userRepository;
//        this.jwtUtil = jwtUtil;
//        this.mailService = mailService;
//    }
//
//    @PostMapping("/login")
//    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
//        System.out.println("=== AUTH LOGIN REQUEST ===");
//        System.out.println("userName: " + request.getUserName());
//        System.out.println("password provided: " + (request.getPassword() != null ? "[PROVIDED]" : "[NULL]"));
//
//        // Validation des entrées
//        if (request.getUserName() == null || request.getUserName().trim().isEmpty()) {
//            System.out.println("❌ Login failed: userName is null or empty");
//            return ResponseEntity.badRequest().body("Username is required");
//        }
//
//        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
//            System.out.println("❌ Login failed: password is null or empty");
//            return ResponseEntity.badRequest().body("Password is required");
//        }
//
//        Optional<User> userOpt = userRepository.findByUserName(request.getUserName());
//        System.out.println("User found in database: " + userOpt.isPresent());
//
//        if (userOpt.isPresent()) {
//            User user = userOpt.get();
//            System.out.println("User email: " + user.getEmail());
//            System.out.println("Password in DB: " + (user.getPassword() != null ? "[ENCODED]" : "[NULL]"));
            
//            boolean passwordMatch = passwordEncoder.matches(request.getPassword(), user.getPassword());
//            System.out.println("Password match: " + passwordMatch);
//
//            if (passwordMatch) {
//                try {
//                    String token = jwtUtil.generateAccessToken(user.getEmail(), "USER");
//                    String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
//                    System.out.println("✅ Login successful for user: " + request.getUserName());
//                    return ResponseEntity.ok(new AuthResponse(token, refreshToken, user, "USER"));
//                } catch (Exception e) {
//                    System.out.println("❌ Token generation failed: " + e.getMessage());
//                    return ResponseEntity.status(500).body("Token generation failed");
//                }
//            } else {
//                System.out.println("❌ Login failed: password mismatch for user: " + request.getUserName());
//            }
//        } else {
//            System.out.println("❌ Login failed: user not found: " + request.getUserName());
//        }
//
//        return ResponseEntity.status(401).body("Identifiants incorrects");
//    }

//    @PostMapping("/refresh")
//    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
//        String refreshToken = request.get("refreshToken");
//        if (refreshToken == null) {
//            return ResponseEntity.badRequest().body("Refresh token is missing");
//        }
//
//        try {
//            String userName = jwtUtil.extractUsername(refreshToken);
//            Optional<User> userOpt = userRepository.findByUserName(userName);
//
//            if (userOpt.isEmpty()) {
//                return ResponseEntity.status(401).body("User not found");
//            }
//
//            if (jwtUtil.validateToken(refreshToken, username)) {
//                String newAccessToken = jwtUtil.generateAccessToken(username, "USER");
//                return ResponseEntity.ok(Map.of("token", newAccessToken));
//            }
//        } catch (Exception e) {
//            return ResponseEntity.status(401).body("Invalid refresh token");
//        }
        
//        return ResponseEntity.status(401).body("Invalid refresh token");
//    }
//
//    @GetMapping("/health")
//    public ResponseEntity<?> health() {
//        return ResponseEntity.ok(Map.of(
//            "status", "UP",
//            "service", "GestionUser",
//            "port", 9092,
//            "timestamp", System.currentTimeMillis()
//        ));
//    }
//
//    @PostMapping("/register")
//    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
//        System.out.println("=== REGISTER REQUEST ===");
//        System.out.println("username: " + request.getUsername());
//        System.out.println("email: " + request.getEmail());

        // Validation des entrées
//        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
//            return ResponseEntity.badRequest().body("Username is required");
//        }
//
//        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
//            return ResponseEntity.badRequest().body("Password is required");
//        }


//        try {
//            // Créer le nouvel utilisateur
//            User user = new User();
//            user.setUsername(request.getUserName());
//            user.setEmail(request.getEmail());
//            user.setPassword(passwordEncoder.encode(request.getPassword()));
//            user.setPhone((int) request.getPhone());
//            user.setDepartement(request.getDepartement());
//
//            User savedUser = userRepository.save(user);
//            System.out.println("✅ User registered successfully: " + savedUser.getUsername());
//
//            // Envoyer un email de confirmation
//            try {
//                String subject = "Bienvenue sur Vermeg Assurance - Votre compte a été créé";
//                String body = "Bonjour " + savedUser.getUsername() + ",\n\n" +
//                        "Votre compte a été créé avec succès sur la plateforme Vermeg Assurance.\n\n" +
//                        "Voici vos identifiants de connexion :\n" +
//                        "Nom d'utilisateur : " + savedUser.getUsername() + "\n" +
//                        "Email : " + savedUser.getEmail() + "\n\n" +
//                        "Vous pouvez maintenant vous connecter à l'application.\n\n" +
//                        "Cordialement,\n" +
//                        "L'équipe Vermeg Assurance";
////
//                mailService.sendEmail(savedUser.getEmail(), subject, body);
//                System.out.println("✅ Email de confirmation envoyé à : " + savedUser.getEmail());
//            } catch (Exception emailError) {
//                System.err.println("⚠️ Erreur lors de l'envoi de l'email : " + emailError.getMessage());
//                // Ne pas échouer l'enregistrement si l'email n'est pas envoyé
//            }
//
//            // Retourner l'utilisateur créé sans le mot de passe
//            savedUser.setPassword(null);
//            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
//
//        } catch (Exception e) {
//            System.out.println("❌ Registration failed: " + e.getMessage());
//            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
//        }
//    }

//    public static class AuthResponse {
//        public String token;
//        public String refreshToken;
//        public Object utilisateur;
//        public String role;
//
//        public AuthResponse(String token, String refreshToken, Object utilisateur, String role) {
//            this.token = token;
//            this.refreshToken = refreshToken;
//            this.utilisateur = utilisateur;
//            this.role = role;
//        }
//    }
//}
