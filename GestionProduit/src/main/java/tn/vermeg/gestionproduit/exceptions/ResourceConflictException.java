package tn.vermeg.gestionproduit.exceptions;

/**
 * Exception pour les conflits de ressources (doublons)
 * 
 * @author PFE Ingénieur - GestionProduit
 * @version 3.0 - Architecture Flexible
 */
public class ResourceConflictException extends RuntimeException {

    public ResourceConflictException(String message) {
        super(message);
    }

    public ResourceConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
