package tn.vermeg.gestionproduit.exceptions;

/**
 * Exception spécifique pour les erreurs de type de garantie
 * 
 * @author PFE Ingénieur - GestionProduit
 * @version 3.0 - Architecture Flexible
 */
public class TypeGarantieException extends RuntimeException {

    public TypeGarantieException(String message) {
        super(message);
    }

    public TypeGarantieException(String message, Throwable cause) {
        super(message, cause);
    }
}
