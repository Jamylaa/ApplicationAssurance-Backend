package tn.vermeg.gestionproduit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AIResponseDTO {

    private String action;
    private AIResultDTO result;
    private String prompt;
    private boolean success;
    private String message;
    private Map<String, Object> metadata;

    public AIResponseDTO() {}

    public AIResponseDTO(String action, AIResultDTO result, String prompt, boolean success) {
        this.action = action;
        this.result = result;
        this.prompt = prompt;
        this.success = success;
    }

    // Getters & Setters
    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public AIResultDTO getResult() {
        return result;
    }

    public void setResult(AIResultDTO result) {
        this.result = result;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public static class AIResultDTO {
        private String id;
        private Object entity;
        private boolean success;
        private String message;

        public AIResultDTO() {}

        public AIResultDTO(String id, Object entity, boolean success, String message) {
            this.id = id;
            this.entity = entity;
            this.success = success;
            this.message = message;
        }

        // Getters & Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public Object getEntity() {
            return entity;
        }

        public void setEntity(Object entity) {
            this.entity = entity;
        }

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
