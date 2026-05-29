package tn.vermeg.gestionproduit.dto;

import jakarta.validation.constraints.NotBlank;

public class AIRequestDTO {

    @NotBlank(message = "Le prompt est obligatoire")
    private String prompt;

    public AIRequestDTO() {}

    public AIRequestDTO(String prompt) {
        this.prompt = prompt;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }
}
