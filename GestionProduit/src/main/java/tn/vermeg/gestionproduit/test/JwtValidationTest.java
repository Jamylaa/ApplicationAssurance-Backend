package tn.vermeg.gestionproduit.test;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tn.vermeg.gestionproduit.util.JwtUtil;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtValidationTest {

    @Value("${jwt.secret}")
    private String secret;

    private final JwtUtil jwtUtil;

    public JwtValidationTest(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public void testJwtValidation() {
        System.out.println("=== JWT VALIDATION TEST ===");
        
        // Test avec la clé actuelle
        String testToken = generateTestToken();
        System.out.println("Generated test token: " + testToken);
        
        try {
            // Test 1: Validation avec JwtUtil
            System.out.println("\n--- Test 1: Validation avec JwtUtil ---");
            String username = jwtUtil.extractUsername(testToken);
            String role = jwtUtil.extractRole(testToken);
            Date expiration = jwtUtil.extractExpiration(testToken);
            boolean isValid = jwtUtil.validateToken(testToken, username);
            
            System.out.println("Username: " + username);
            System.out.println("Role: " + role);
            System.out.println("Expiration: " + expiration);
            System.out.println("Valid: " + isValid);
            
            // Test 2: Validation directe avec parser
            System.out.println("\n--- Test 2: Validation directe ---");
            SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(testToken)
                    .getBody();
            
            System.out.println("Claims: " + claims.toString());
            System.out.println("Direct validation successful!");
            
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("=== END JWT VALIDATION TEST ===");
    }

    private String generateTestToken() {
        SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setSubject("testuser")
                .claim("role", "USER")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 heure
                .signWith(secretKey)
                .compact();
    }
}
