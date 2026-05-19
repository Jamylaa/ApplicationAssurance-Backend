package tn.vermeg.gestionproduit.entities;

/**
 * Énumération des types de garanties standards
 * Utilisée pour la compatibilité avec le code existant
 */
public enum TypeGarantie {
    HOSPITALISATION,
    DENTAIRE,
    OPTIQUE,
    CONSULTATION,
    EXAMEN,
    MEDICAMENTS,
    SOINS_GENERAUX,
    INTERNATIONAL;
    
    public static java.util.List<TypeGarantie> getHospitalisationTypes() {
        return java.util.List.of(HOSPITALISATION);
    }
    
    public static java.util.List<TypeGarantie> getDentaireTypes() {
        return java.util.List.of(DENTAIRE);
    }
    
    public static java.util.List<TypeGarantie> getOptiqueTypes() {
        return java.util.List.of(OPTIQUE);
    }
    
    public static java.util.List<TypeGarantie> getConsultationTypes() {
        return java.util.List.of(CONSULTATION);
    }
}
