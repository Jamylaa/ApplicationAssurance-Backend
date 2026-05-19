package tn.vermeg.gestionproduit.exceptions;

import lombok.Getter;

/**
 * Exception pour les erreurs métier
 * 
 * @author PFE Ingénieur - GestionProduit
 * @version 3.0 - Architecture Flexible
 */
@Getter
public class BusinessException extends RuntimeException {
    private final String errorCode;
    
    public BusinessException(String message) {
        super(message);
        this.errorCode = "BUSINESS_ERROR";
    }
    
    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "BUSINESS_ERROR";
    }
    
    public BusinessException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}
