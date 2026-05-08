package tn.vermeg.gestionproduit.services;

import org.springframework.stereotype.Service;
import tn.vermeg.gestionproduit.entities.*;
import java.util.Map;
import java.util.List;

@Service
public class EntityMapperService {

    public Garantie mapToGarantie(Map<String, Object> data) {
        Garantie garantie = new Garantie();
        
        if (data.containsKey("nomGarantie")) {
            garantie.setNomGarantie((String) data.get("nomGarantie"));
        }
        
        if (data.containsKey("description")) {
            garantie.setDescription((String) data.get("description"));
        }
        
        if (data.containsKey("typeGarantie")) {
            String type = (String) data.get("typeGarantie");
            try {
                garantie.setTypeGarantie(TypeGarantie.valueOf(type));
            } catch (IllegalArgumentException e) {
                garantie.setTypeGarantie(TypeGarantie.HOSPITALISATION);
            }
        }
        
        if (data.containsKey("tauxRemboursement")) {
            garantie.setTauxRemboursement(((Number) data.get("tauxRemboursement")).doubleValue());
        }
        
        if (data.containsKey("typeMontant")) {
            String type = (String) data.get("typeMontant");
            try {
                garantie.setTypeMontant(TypeMontant.valueOf(type));
            } catch (IllegalArgumentException e) {
                garantie.setTypeMontant(TypeMontant.FRAIS_REELS);
            }
        }
        
        if (data.containsKey("typePlafond")) {
            String type = (String) data.get("typePlafond");
            try {
                garantie.setTypePlafond(TypePlafond.valueOf(type));
            } catch (IllegalArgumentException e) {
                garantie.setTypePlafond(TypePlafond.GLOBAL);
            }
        }
        
        if (data.containsKey("plafondAnnuel")) {
            garantie.setPlafondAnnuel(((Number) data.get("plafondAnnuel")).doubleValue());
        }
        
        if (data.containsKey("plafondMensuel")) {
            garantie.setPlafondMensuel(((Number) data.get("plafondMensuel")).doubleValue());
        }
        
        if (data.containsKey("plafondParActe")) {
            garantie.setPlafondParActe(((Number) data.get("plafondParActe")).doubleValue());
        }
        
        if (data.containsKey("franchise")) {
            garantie.setFranchise(((Number) data.get("franchise")).doubleValue());
        }
        
        if (data.containsKey("coutMoyenParSinistre")) {
            garantie.setCoutMoyenParSinistre(((Number) data.get("coutMoyenParSinistre")).doubleValue());
        }
        
        if (data.containsKey("dureeMinContrat")) {
            garantie.setDureeMinContrat(((Number) data.get("dureeMinContrat")).intValue());
        }
        
        if (data.containsKey("dureeMaxContrat")) {
            garantie.setDureeMaxContrat(((Number) data.get("dureeMaxContrat")).intValue());
        }
        
        if (data.containsKey("resiliableAnnuellement")) {
            garantie.setResiliableAnnuellement((Boolean) data.get("resiliableAnnuellement"));
        }
        
        if (data.containsKey("creePar")) {
            garantie.setCreePar((String) data.get("creePar"));
        }
        
        garantie.setStatut(Statut.ACTIF);
        return garantie;
    }

    public Produit mapToProduit(Map<String, Object> data) {
        Produit produit = new Produit();
        
        if (data.containsKey("nomProduit")) {
            produit.setNomProduit((String) data.get("nomProduit"));
        }
        
        if (data.containsKey("description")) {
            produit.setDescription((String) data.get("description"));
        }
        
        if (data.containsKey("typeProduit")) {
            String type = (String) data.get("typeProduit");
            try {
                produit.setTypeProduit(TypeProduit.valueOf(type));
            } catch (IllegalArgumentException e) {
                produit.setTypeProduit(TypeProduit.SANTE);
            }
        }
        
        if (data.containsKey("statut")) {
            String statut = (String) data.get("statut");
            try {
                produit.setStatut(Statut.valueOf(statut));
            } catch (IllegalArgumentException e) {
                produit.setStatut(Statut.ACTIF);
            }
        } else {
            produit.setStatut(Statut.ACTIF);
        }
        
        return produit;
    }

    public Pack mapToPack(Map<String, Object> data) {
        Pack pack = new Pack();
        
        if (data.containsKey("nomPack")) {
            pack.setNomPack((String) data.get("nomPack"));
        }
        
        if (data.containsKey("description")) {
            pack.setDescription((String) data.get("description"));
        }
        
        if (data.containsKey("typeProduit")) {
            String type = (String) data.get("typeProduit");
            try {
                pack.setNomProduit(type);
            } catch (IllegalArgumentException e) {
                pack.setNomProduit("SANTE");
            }
        }
        
        if (data.containsKey("statut")) {
            String statut = (String) data.get("statut");
            try {
                pack.setStatut(Statut.valueOf(statut));
            } catch (IllegalArgumentException e) {
                pack.setStatut(Statut.ACTIF);
            }
        } else {
            pack.setStatut(Statut.ACTIF);
        }
        
        if (data.containsKey("ageMinimum")) {
            pack.setAgeMinimum(((Number) data.get("ageMinimum")).intValue());
        }
        
        if (data.containsKey("ageMaximum")) {
            pack.setAgeMaximum(((Number) data.get("ageMaximum")).intValue());
        }
        
        if (data.containsKey("typeClients")) {
            String type = (String) data.get("typeClients");
            try {
                pack.setTypeClients(List.of(TypeClient.valueOf(type)));
            } catch (IllegalArgumentException e) {
                pack.setTypeClients(List.of(TypeClient.INDIVIDUEL));
            }
        }
        
        if (data.containsKey("ancienneteContratMois")) {
            pack.setAncienneteContratMois(((Number) data.get("ancienneteContratMois")).intValue());
        }
        
        if (data.containsKey("couvertureGeographique")) {
            String couverture = (String) data.get("couvertureGeographique");
            try {
                pack.setCouvertureGeographique(CouvertureGeographique.valueOf(couverture));
            } catch (IllegalArgumentException e) {
                pack.setCouvertureGeographique(CouvertureGeographique.NATIONAL);
            }
        }
        
        if (data.containsKey("prixMensuel")) {
            pack.setPrixMensuel(((Number) data.get("prixMensuel")).doubleValue());
        }
        
        if (data.containsKey("dureeMinContrat")) {
            pack.setDureeMinContrat(((Number) data.get("dureeMinContrat")).intValue());
        }
        
        if (data.containsKey("dureeMaxContrat")) {
            pack.setDureeMaxContrat(((Number) data.get("dureeMaxContrat")).intValue());
        }
        
        if (data.containsKey("niveauCouverture")) {
            String niveau = (String) data.get("niveauCouverture");
            try {
                pack.setNiveauCouverture(NiveauCouverture.valueOf(niveau));
            } catch (IllegalArgumentException e) {
                pack.setNiveauCouverture(NiveauCouverture.PREMIUM);
            }
        }
        
        return pack;
    }
}
