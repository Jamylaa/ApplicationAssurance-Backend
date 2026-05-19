package tn.vermeg.gestionproduit.entities;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entité de référence pour les types de garanties
 * Permet une gestion centralisée et flexible des types sans enum rigide
 */
@Document(collection = "types_garantie_reference")
public class TypeGarantieReference {

    @Id
    private String id;

    /**
     * Code unique du type de garantie (ex: "HOSP", "DENT_PREV", "OPT_LUN")
     */
   @NotBlank(message = "Le code est obligatoire")
    @Size(min = 2, max = 20, message = "Le code doit contenir entre 2 et 20 caractères")
    @Field("code")
    private String code;

     //Nom lisible du type (ex: "Hospitalisation", "Dentaire préventif")

//    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 3, max = 100, message = "Le nom doit contenir entre 3 et 100 caractères")
    @Field("nom")
    private String nom;

     //Description détaillée du type
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    @Field("description")
    private String description;


     //Catégorie du type (HOSPITALISATION, DENTAIRE, OPTIQUE, etc.)
    @NotBlank(message = "La catégorie est obligatoire")
    @Field("categorie")
    private String categorie;

     // Synonymes pour la recherche IA/Frontend
    @Field("synonyms")
    private List<String> synonyms;

     //Valeurs par défaut recommandées pour ce type
    @Field("taux_remboursement_defaut")
    private Double tauxRemboursementDefaut;

    @Field("plafond_annuel_defaut")
    private Double plafondAnnuelDefaut;

    @Field("franchise_defaut")
    private Double franchiseDefaut;

     // Statut actif/inactif du type
   @NotNull(message = "Le statut actif est obligatoire")
    @Field("actif")
    private Boolean actif = true;

     // Ordre d'affichage dans les listes
    @Field("ordre_affichage")
    private Integer ordreAffichage;

     //Tags pour classification avancée
    @Field("tags")
    private List<String> tags;

    // === AUDIT ===

    @Field("cree_par")
    private String creePar;

    @Field("modifie_par")
    private String modifiePar;

    @CreatedDate
    @Field("date_creation")
    private LocalDateTime dateCreation;

    @LastModifiedDate
    @Field("date_modification")
    private LocalDateTime dateModification;

    @Field("date_desactivation")
    private LocalDateTime dateDesactivation;

    // === CONSTRUCTEURS ===

    public TypeGarantieReference() {
        this.dateCreation = LocalDateTime.now();
        this.dateModification = LocalDateTime.now();
        this.creePar = "system";
        this.modifiePar = "system";
    }

    public TypeGarantieReference(String code, String nom, String categorie) {
        this();
        this.code = code;
        this.nom = nom;
        this.categorie = categorie;
    }

    // === MÉTHODES MÉTIER ===

     // Vérifie si le type est actif
    public boolean estActif() {
        return actif != null && actif && dateDesactivation == null;
    }

     //Active le type
    public void activer() {
        this.actif = true;
        this.dateDesactivation = null;
        this.dateModification = LocalDateTime.now();
    }

     // Désactive le type
    public void desactiver() {
        this.actif = false;
        this.dateDesactivation = LocalDateTime.now();
        this.dateModification = LocalDateTime.now();
    }

     // Vérifie si le type correspond à une recherche
    public boolean correspond(String recherche) {
        if (recherche == null || recherche.trim().isEmpty()) {
            return false;
        }

        String normalizedSearch = recherche.trim().toLowerCase();

        // Recherche exacte
        if (code.equalsIgnoreCase(normalizedSearch) || 
            nom.equalsIgnoreCase(normalizedSearch)) {
            return true;
        }

        // Recherche partielle
        if (nom.toLowerCase().contains(normalizedSearch) ||
            code.toLowerCase().contains(normalizedSearch)) {
            return true;
        }

        // Recherche dans les synonymes
        if (synonyms != null) {
            for (String synonym : synonyms) {
                if (synonym.toLowerCase().contains(normalizedSearch) ||
                    normalizedSearch.contains(synonym.toLowerCase())) {
                    return true;
                }
            }
        }

        // Recherche dans les tags
        if (tags != null) {
            for (String tag : tags) {
                if (tag.toLowerCase().contains(normalizedSearch)) {
                    return true;
                }
            }
        }

        return false;
    }

     // Ajoute un synonyme
    public void addSynonym(String synonym) {
        if (synonym != null && !synonym.trim().isEmpty()) {
            if (synonyms == null) {
                synonyms = new java.util.ArrayList<>();
            }
            String normalizedSynonym = synonym.trim().toLowerCase();
            if (!synonyms.contains(normalizedSynonym)) {
                synonyms.add(normalizedSynonym);
                dateModification = LocalDateTime.now();
            }
        }
    }

     // Ajoute un tag
    public void addTag(String tag) {
        if (tag != null && !tag.trim().isEmpty()) {
            if (tags == null) {
                tags = new java.util.ArrayList<>();
            }
            String normalizedTag = tag.trim().toLowerCase();
            if (!tags.contains(normalizedTag)) {
                tags.add(normalizedTag);
                dateModification = LocalDateTime.now();
            }
        }
    }

     // Normalise le code
    public void normalizeCode() {
        if (code != null) {
            this.code = code.trim().toUpperCase();
        }
    }

     //Normalise le nom
    public void normalizeNom() {
        if (nom != null) {
            this.nom = nom.trim();
        }
    }

     // Vérifie si l'entité est valide
    public boolean isValid() {
        return code != null && !code.trim().isEmpty() &&
               nom != null && !nom.trim().isEmpty() &&
               categorie != null && !categorie.trim().isEmpty() &&
               actif != null;
    }

    // === GETTERS/SETTERS ===

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
        this.dateModification = LocalDateTime.now();
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
        this.dateModification = LocalDateTime.now();
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
        this.dateModification = LocalDateTime.now();
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
        this.dateModification = LocalDateTime.now();
    }

    public List<String> getSynonyms() {
        return synonyms;
    }

    public void setSynonyms(List<String> synonyms) {
        this.synonyms = synonyms;
        this.dateModification = LocalDateTime.now();
    }

    public Double getTauxRemboursementDefaut() {
        return tauxRemboursementDefaut;
    }

    public void setTauxRemboursementDefaut(Double tauxRemboursementDefaut) {
        this.tauxRemboursementDefaut = tauxRemboursementDefaut;
        this.dateModification = LocalDateTime.now();
    }

    public Double getPlafondAnnuelDefaut() {
        return plafondAnnuelDefaut;
    }

    public void setPlafondAnnuelDefaut(Double plafondAnnuelDefaut) {
        this.plafondAnnuelDefaut = plafondAnnuelDefaut;
        this.dateModification = LocalDateTime.now();
    }

    public Double getFranchiseDefaut() {
        return franchiseDefaut;
    }

    public void setFranchiseDefaut(Double franchiseDefaut) {
        this.franchiseDefaut = franchiseDefaut;
        this.dateModification = LocalDateTime.now();
    }

    public Boolean getActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
        this.dateModification = LocalDateTime.now();
    }

    public Integer getOrdreAffichage() {
        return ordreAffichage;
    }

    public void setOrdreAffichage(Integer ordreAffichage) {
        this.ordreAffichage = ordreAffichage;
        this.dateModification = LocalDateTime.now();
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
        this.dateModification = LocalDateTime.now();
    }

    public String getCreePar() {
        return creePar;
    }

    public void setCreePar(String creePar) {
        this.creePar = creePar;
    }

    public String getModifiePar() {
        return modifiePar;
    }

    public void setModifiePar(String modifiePar) {
        this.modifiePar = modifiePar;
        this.dateModification = LocalDateTime.now();
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    public LocalDateTime getDateDesactivation() {
        return dateDesactivation;
    }

    public void setDateDesactivation(LocalDateTime dateDesactivation) {
        this.dateDesactivation = dateDesactivation;
    }

    // === MÉTHODES OBJET ===

    @Override
    public String toString() {
        return String.format("TypeGarantieReference{code='%s', nom='%s', categorie='%s', actif=%s}", 
                           code, nom, categorie, actif);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        TypeGarantieReference that = (TypeGarantieReference) obj;
        return code != null ? code.equals(that.code) : that.code == null;
    }

    @Override
    public int hashCode() {
        return code != null ? code.hashCode() : 0;
    }
}
