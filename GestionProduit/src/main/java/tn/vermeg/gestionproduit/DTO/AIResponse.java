package tn.vermeg.gestionproduit.DTO;

import lombok.Data;
import java.util.Map;

@Data
    public class AIResponse {
        private String type;
        private Map<String, Object> data;
    }