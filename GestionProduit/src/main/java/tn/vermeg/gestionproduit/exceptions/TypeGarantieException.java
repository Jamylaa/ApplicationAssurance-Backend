package tn.vermeg.gestionproduit.exceptions;

public class TypeGarantieException extends RuntimeException {

    public TypeGarantieException(String message) {
        super(message);
    }

    public TypeGarantieException(String message, Throwable cause) {
        super(message, cause);
    }
}
