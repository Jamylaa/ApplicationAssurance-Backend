package tn.vermeg.gestionproduit.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tn.vermeg.gestionproduit.util.JwtUtil;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String requestURI = request.getRequestURI();
        final String method = request.getMethod();
        
        // Allow OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Check if the endpoint is public
        boolean isPublicEndpoint = requestURI.startsWith("/api/auth/") || requestURI.startsWith("/actuator/");
        
        if (isPublicEndpoint) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // For protected endpoints, validate JWT
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("Missing or invalid Authorization header");
            return;
        }

        try {
            String token = authHeader.substring(7);
            
            // Diagnostic logs
            System.out.println("=== JWT FILTER DEBUG (GESTIONPRODUIT) ===");
            System.out.println("Token reçu: " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));
            System.out.println("Request URI: " + requestURI);
            System.out.println("Method: " + method);
            
            try {
                Claims claims = jwtUtil.extractAllClaims(token);
                
                System.out.println("JWT VALID ✔️");
                System.out.println("USER: " + claims.getSubject());
                System.out.println("ROLE: " + claims.get("role"));
                System.out.println("EMAIL: " + claims.getSubject());
                System.out.println("============================================");
                
                // Vérification importante : le subject doit être l'email
                String subject = claims.getSubject();
                if (subject == null || !subject.equals("benabdelkadersamir7@gmail.com")) {
                    System.out.println("JWT ERROR ❌: Subject incorrect. Attendu: benabdelkadersamir7@gmail.com, Reçu: " + subject);
                    throw new Exception("Subject incorrect: " + subject);
                }
                
                String userName = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                java.util.Date expiration = jwtUtil.extractExpiration(token);
                boolean tokenValid = userName != null && !isTokenExpired(token);
                
                System.out.println("SECRET KEY FROM PROPERTIES: " + jwtUtil.getSecret());
                System.out.println("Username extrait: " + userName);
                System.out.println("Role extrait: " + role);
                System.out.println("Expiration: " + expiration);
                System.out.println("Token valide: " + tokenValid);
                
                if (userName != null && tokenValid && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userName, null, Collections.emptyList());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("Authentication set in SecurityContext");
                }
            } catch (Exception e) {
                System.out.println("JWT ERROR ❌: " + e.getMessage());
                throw e;
            }
        } catch (Exception e) {
            System.out.println("JWT Error: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("JWT Error: " + e.getMessage());
            return;
        }
        
        filterChain.doFilter(request, response);
    }
    
    private boolean isTokenExpired(String token) {
        try {
            return jwtUtil.extractExpiration(token).before(new java.util.Date());
        } catch (Exception e) {
            return true;
        }
    }
}
