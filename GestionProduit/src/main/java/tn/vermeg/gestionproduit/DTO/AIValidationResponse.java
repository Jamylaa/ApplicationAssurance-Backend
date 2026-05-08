package tn.vermeg.gestionproduit.DTO;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AIValidationResponse {
    private boolean valid;
    private String type;
    private Map<String, Object> data;
    private List<String> errors;
    private List<String> warnings;
    private String suggestion;
    
    public static AIValidationResponse success(String type, Map<String, Object> data) {
        AIValidationResponse response = new AIValidationResponse();
        response.setValid(true);
        response.setType(type);
        response.setData(data);
        return response;
    }
    
    public static AIValidationResponse error(List<String> errors) {
        AIValidationResponse response = new AIValidationResponse();
        response.setValid(false);
        response.setErrors(errors);
        return response;
    }
    
    public static AIValidationResponse warning(String type, Map<String, Object> data, List<String> warnings) {
        AIValidationResponse response = new AIValidationResponse();
        response.setValid(true);
        response.setType(type);
        response.setData(data);
        response.setWarnings(warnings);
        return response;
    }
}
