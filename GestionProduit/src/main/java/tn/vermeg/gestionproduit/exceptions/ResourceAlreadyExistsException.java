package tn.vermeg.gestionproduit.exceptions;

import lombok.Getter;

/**
 * Exception pour les ressources déjà existantes
 * 
 * @author PFE Ingénieur - GestionProduit
 * @version 3.0 - Architecture Flexible
 */
@Getter
public class ResourceAlreadyExistsException extends RuntimeException {
    private final String resourceType;
    private final String resourceId;
    
    public ResourceAlreadyExistsException(String resourceType, String resourceId) {
        super(String.format("%s with id '%s' already exists", resourceType, resourceId));
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }
    
    public ResourceAlreadyExistsException(String resourceType, String resourceId, String message) {
        super(message);
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }
}
