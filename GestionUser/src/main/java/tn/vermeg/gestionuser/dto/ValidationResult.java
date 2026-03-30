package tn.vermeg.gestionuser.dto;
public class ValidationResult {
    private boolean isValid;
    private String message;
    public ValidationResult(boolean isValid, String message) {
        this.isValid = isValid;
        this.message = message;
    }
    public ValidationResult() {}
    public boolean isValid() {
        return isValid;
    }
    public void setValid(boolean valid) {
        isValid = valid;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}