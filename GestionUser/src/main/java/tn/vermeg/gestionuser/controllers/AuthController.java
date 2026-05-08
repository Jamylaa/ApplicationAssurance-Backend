package tn.vermeg.gestionuser.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionuser.dto.AuthRequest;
import tn.vermeg.gestionuser.dto.RegisterRequest;
import tn.vermeg.gestionuser.entities.User;
import tn.vermeg.gestionuser.repositories.UserRepository;
import tn.vermeg.gestionuser.services.MailService;
import tn.vermeg.gestionuser.utils.JwtUtil;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailService mailService;

    public AuthController(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mailService = mailService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {

        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateToken(user.getUsername());

                // Remove password from user object before sending to frontend
                user.setPassword(null);

                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "utilisateur", user
                ));
            }
        }

        return ResponseEntity.status(401).body("Identifiants incorrects");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

//        if (userRepository.existsByUsername(request.getUsername())) {
//            return ResponseEntity.badRequest().body("Username already exists");
//        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone((int) request.getPhone());
        user.setDepartement(request.getDepartement());

        User saved = userRepository.save(user);
        saved.setPassword(null);

       //  Envoyer un email de confirmation
//        try {
//            mailService.sendCredentials(
//                request.getEmail(),
//                request.getUsername(),
//                request.getPassword()
//            );
//        } catch (Exception e) {
//            System.err.println("Erreur lors de l'envoi de l'email: " + e.getMessage());
//        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.badRequest().body("Refresh token is missing");
        }

        try {
            String username = jwtUtil.extractUsername(refreshToken);
            Optional<User> userOpt = userRepository.findByUsername(username);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("User not found");
            }

            if (jwtUtil.validateToken(refreshToken, username)) {
                String newAccessToken = jwtUtil.generateToken(username);
                return ResponseEntity.ok(Map.of("token", newAccessToken));
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid refresh token");
        }

        return ResponseEntity.status(401).body("Invalid refresh token");
    }
}
