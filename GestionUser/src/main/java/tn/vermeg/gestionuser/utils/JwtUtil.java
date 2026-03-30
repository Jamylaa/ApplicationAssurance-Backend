package tn.vermeg.gestionuser.utils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.nio.charset.StandardCharsets;
public class JwtUtil {

    // Minimum 32 caractères pour HS256
    private static final String SECRET = "mySuperSecretKeyForJwtAuthentication123456";
    private static final Key SECRET_KEY =
            Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public static String generateToken(String userName, String role) {
        return Jwts.builder()
                .setSubject(userName)
                .claim("role", role)  // "admin" ou "client"
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1h
                .signWith(SECRET_KEY)
                .compact();
    }
    public static String getUserName(String token) {
        return getClaims(token).getSubject(); }

    public static String getRole(String token) {
        return getClaims(token).get("role", String.class);}

    private static Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}