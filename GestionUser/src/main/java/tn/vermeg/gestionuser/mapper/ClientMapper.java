package tn.vermeg.gestionuser.mapper;

import org.springframework.stereotype.Component;
import tn.vermeg.gestionuser.dto.ClientDTO;
import tn.vermeg.gestionuser.dto.ClientResponseDTO;
import tn.vermeg.gestionuser.entities.Client;
import tn.vermeg.gestionuser.entities.Role;

@Component
public class ClientMapper {

    public Client toEntity(ClientDTO dto) {
        if (dto == null) {
            return null;
        }

        Client client = new Client();
        client.setUserName(dto.getUserName());
        client.setEmail(dto.getEmail());
        client.setPassword(dto.getPassword());
        client.setPhone(dto.getPhone());
        client.setAge(dto.getAge() != null ? dto.getAge() : 0);
        client.setSexe(dto.getSexe());
        client.setProfession(dto.getProfession());
        client.setSituationFamiliale(dto.getSituationFamiliale());
        client.setMaladieChronique(dto.isMaladieChronique() != null ? dto.isMaladieChronique() : false);
        client.setDiabetique(dto.isDiabetique() != null ? dto.isDiabetique() : false);
        client.setTension(dto.isTension() != null ? dto.isTension() : false);
        client.setNombreBeneficiaires(dto.getNombreBeneficiaires() != null ? dto.getNombreBeneficiaires() : 1);
        client.setRole(Role.CLIENT);
        client.setActif(true);
        
        return client;
    }

    public ClientDTO toDto(Client entity) {
        if (entity == null) {
            return null;
        }

        ClientDTO dto = new ClientDTO();
        dto.setUserName(entity.getUserName());
        dto.setEmail(entity.getEmail());
        dto.setPassword(entity.getPassword()); // Attention: ne devrait pas être exposé
        dto.setPhone(entity.getPhone());
        dto.setAge(entity.getAge());
        dto.setSexe(entity.getSexe());
        dto.setProfession(entity.getProfession());
        dto.setSituationFamiliale(entity.getSituationFamiliale());
        dto.setMaladieChronique(entity.isMaladieChronique());
        dto.setDiabetique(entity.isDiabetique());
        dto.setTension(entity.isTension());
        dto.setNombreBeneficiaires(entity.getNombreBeneficiaires());
        
        return dto;
    }

    public ClientResponseDTO toResponseDto(Client entity) {
        if (entity == null) {
            return null;
        }

        ClientResponseDTO dto = new ClientResponseDTO();
        dto.setIdUser(entity.getIdUser());
        dto.setUserName(entity.getUserName());
        dto.setEmail(entity.getEmail());
        // Ne pas inclure le mot de passe dans la réponse
        dto.setPhone(entity.getPhone());
        dto.setAge(entity.getAge());
        dto.setSexe(entity.getSexe());
        dto.setProfession(entity.getProfession());
        dto.setSituationFamiliale(entity.getSituationFamiliale());
        dto.setMaladieChronique(entity.isMaladieChronique());
        dto.setDiabetique(entity.isDiabetique());
        dto.setTension(entity.isTension());
        dto.setNombreBeneficiaires(entity.getNombreBeneficiaires());
        dto.setRole(entity.getRole().name());
        dto.setActif(entity.getActif());
        
        return dto;
    }

    public void updateEntityFromDto(ClientDTO dto, Client entity) {
        if (dto == null || entity == null) {
            return;
        }

        // Mise à jour uniquement des champs non nulls
        if (dto.getUserName() != null) {
            entity.setUserName(dto.getUserName());
        }
        if (dto.getEmail() != null) {
            entity.setEmail(dto.getEmail());
        }
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            entity.setPassword(dto.getPassword());
        }
        if (dto.getPhone() != null) {
            entity.setPhone(dto.getPhone());
        }
        if (dto.getAge() != null && dto.getAge() != 0) {
            entity.setAge(dto.getAge());
        }
        if (dto.getSexe() != null) {
            entity.setSexe(dto.getSexe());
        }
        if (dto.getProfession() != null) {
            entity.setProfession(dto.getProfession());
        }
        if (dto.getSituationFamiliale() != null) {
            entity.setSituationFamiliale(dto.getSituationFamiliale());
        }
        if (dto.isMaladieChronique() != null) {
            entity.setMaladieChronique(dto.isMaladieChronique());
        }
        if (dto.isDiabetique() != null) {
            entity.setDiabetique(dto.isDiabetique());
        }
        if (dto.isTension() != null) {
            entity.setTension(dto.isTension());
        }
        if (dto.getNombreBeneficiaires() != null && dto.getNombreBeneficiaires() != 0) {
            entity.setNombreBeneficiaires(dto.getNombreBeneficiaires());
        }
    }
}
