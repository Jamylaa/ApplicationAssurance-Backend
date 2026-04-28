package tn.vermeg.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tn.vermeg.gateway.filter.JwtGatewayFilter;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder, JwtGatewayFilter jwtGatewayFilter) {
        return builder.routes()
            // GestionUser Service (port 9092)
            .route("gestion-user", r -> r.path("/api/users/**", "/api/auth/**")
                .filters(f -> f.filter(jwtGatewayFilter))
                .uri("http://localhost:9092"))
            
            // GestionProduit Service (port 9093)
            .route("gestion-produit", r -> r.path("/api/produits/**", "/api/packs/**")
                .filters(f -> f.filter(jwtGatewayFilter))
                .uri("http://localhost:9093"))
            
            // GestionSouscription Service (port 9094)
            .route("gestion-souscription", r -> r.path("/api/souscriptions/**")
                .filters(f -> f.filter(jwtGatewayFilter))
                .uri("http://localhost:9094"))
            
            // Recommendation Service (port 9095)
            .route("recommendation", r -> r.path("/api/recommendations/**")
                .filters(f -> f.filter(jwtGatewayFilter))
                .uri("http://localhost:9095"))
            
            // AI Service (port 5001) - No JWT filter for AI service
            .route("ai-service", r -> r.path("/api/ai/**", "/api/recommendation-chat/**", "/api/admin-chat/**", "/api/google/**")
                .uri("http://localhost:5001"))
            
            .build();
    }
}
