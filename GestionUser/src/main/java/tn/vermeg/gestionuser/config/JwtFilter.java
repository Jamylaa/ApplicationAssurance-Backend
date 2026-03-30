package tn.vermeg.gestionuser.config;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tn.vermeg.gestionuser.utils.JwtUtil;
import java.io.IOException;
import java.util.Collections;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;}
        try {
            String token = authHeader.substring(7);
            String userName = JwtUtil.getUserName(token);
            String role = JwtUtil.getRole(token); // "ROLE_ADMIN" ou "ROLE_CLIENT"
            if (userName != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // 🔹 Utiliser directement le rôle qui a déjà le préfixe ROLE_
                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority(role);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userName,
                                null,
                                Collections.singleton(authority));
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);}
        } catch (Exception e) {
            System.out.println("JWT invalide : " + e.getMessage());}
        filterChain.doFilter(request, response);
    }
}