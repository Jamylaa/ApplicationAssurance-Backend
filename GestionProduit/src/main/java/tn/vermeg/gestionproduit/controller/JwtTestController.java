package tn.vermeg.gestionproduit.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionproduit.utils.JwtUtil;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class JwtTestController {

    private final JwtUtil jwtUtil;

    public JwtTestController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> publicEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Ceci est un endpoint public");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/protected")
    public ResponseEntity<Map<String, Object>> protectedEndpoint() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Ceci est un endpoint protégé");
        response.put("username", username);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/token/expired")
    public ResponseEntity<Map<String, Object>> generateExpiredToken() {
        // Générer un token expiré (date d'expiration dans le passé)
        String expiredToken = jwtUtil.generateToken("testuser");
        
        Map<String, Object> response = new HashMap<>();
        response.put("expiredToken", expiredToken);
        response.put("message", "Token expiré généré pour test");
        response.put("expirationDate", jwtUtil.getExpirationDate(expiredToken));
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/token/invalid")
    public ResponseEntity<Map<String, Object>> generateInvalidToken() {
        Map<String, Object> response = new HashMap<>();
        response.put("invalidToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token.here");
        response.put("message", "Token invalide généré pour test");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/token/valid")
    public ResponseEntity<Map<String, Object>> generateValidToken() {
        String validToken = jwtUtil.generateToken("testuser");
        
        Map<String, Object> response = new HashMap<>();
        response.put("validToken", validToken);
        response.put("message", "Token valide généré pour test");
        response.put("expirationDate", jwtUtil.getExpirationDate(validToken));
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/token/validate/{token}")
    public ResponseEntity<Map<String, Object>> validateToken(@PathVariable String token) {
        Map<String, Object> response = new HashMap<>();
        
        boolean isValid = jwtUtil.validateToken(token);
        String username = jwtUtil.extractUsername(token);
        boolean isExpired = jwtUtil.isTokenExpired(token);
        
        response.put("token", token);
        response.put("isValid", isValid);
        response.put("isExpired", isExpired);
        response.put("username", username);
        response.put("expirationDate", jwtUtil.getExpirationDate(token));
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
}
