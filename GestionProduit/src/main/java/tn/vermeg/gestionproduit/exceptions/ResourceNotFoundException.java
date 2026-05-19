package tn.vermeg.gestionproduit.exceptions;

import lombok.Getter;

/**
 * Exception pour les ressources non trouvées
 * 
 * @author PFE Ingénieur - GestionProduit
 * @version 3.0 - Architecture Flexible
 */
@Getter
public class ResourceNotFoundException extends RuntimeException {
    private final String resourceType;
    private final String resourceId;

    public ResourceNotFoundException(String resourceType, String resourceId) {
        super(String.format("%s with id '%s' not found", resourceType, resourceId));
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }

    public ResourceNotFoundException(String resourceType, String resourceId, String message) {
        super(message);
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }
}
