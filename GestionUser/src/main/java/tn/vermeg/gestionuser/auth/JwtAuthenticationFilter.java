package tn.vermeg.gestionuser.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import tn.vermeg.gestionuser.services.impl.UserServiceImpl;
import tn.vermeg.gestionuser.utils.JwtUtil;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

        private final JwtUtil jwtUtil;
        private final UserServiceImpl userService;

        public JwtAuthenticationFilter(JwtUtil jwtUtil, UserServiceImpl userService) {
            this.jwtUtil = jwtUtil;
            this.userService = userService;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain)
                throws ServletException, IOException {

            String path = request.getServletPath();

            // 🔥 EXCLUSION DES ENDPOINTS AUTH
            if (path.startsWith("/api/auth")) {
                filterChain.doFilter(request, response);
                return;
            }

            String header = request.getHeader("Authorization");

            if (header != null && header.startsWith("Bearer ")) {

                String token = header.substring(7);
                
                try {
                    String username = jwtUtil.extractUsername(token);

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                        UserDetails userDetails = userService.loadUserByUsername(username);

                        if (jwtUtil.validateToken(token, username)) {

                            UsernamePasswordAuthenticationToken auth =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );

                            SecurityContextHolder.getContext().setAuthentication(auth);
                        }
                    }
                } catch (RuntimeException e) {
                    if (e.getMessage().contains("Token expired")) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("\"Token expiré - Veuillez vous reconnecter\"");
                        response.setContentType("application/json");
                        return;
                    } else if (e.getMessage().contains("Invalid token")) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("\"Token invalide\"");
                        response.setContentType("application/json");
                        return;
                    }
                }
            }

            filterChain.doFilter(request, response);
        }
    }