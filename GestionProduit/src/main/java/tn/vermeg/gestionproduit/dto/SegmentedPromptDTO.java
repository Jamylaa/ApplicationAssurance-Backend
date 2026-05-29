package tn.vermeg.gestionproduit.dto;

/**
 * Prompt découpé : zone pack vs zone garanties pour éviter que les regex
 * d'une entité ne consomment le texte de l'autre.
 */
public final class SegmentedPromptDTO {

    private final String fullPrompt;
    private final String packSection;
    private final String garantiesSection;
    private final String markerMatched;

    public SegmentedPromptDTO(String fullPrompt, String packSection, String garantiesSection, String markerMatched) {
        this.fullPrompt = fullPrompt != null ? fullPrompt : "";
        this.packSection = packSection != null ? packSection : "";
        this.garantiesSection = garantiesSection != null ? garantiesSection : "";
        this.markerMatched = markerMatched != null ? markerMatched : "";
    }

    public String getFullPrompt() {
        return fullPrompt;
    }

    /** Texte utilisé pour nom, prix, âges, type client, niveau pack, etc. */
    public String getPackSection() {
        return packSection;
    }

    /** Texte utilisé pour garanties (noms, plafonds, franchises…). Vide si pas de découpe. */
    public String getGarantiesSection() {
        return garantiesSection;
    }

    public String getMarkerMatched() {
        return markerMatched;
    }

    public boolean isSplit() {
        return !garantiesSection.isBlank();
    }
}
