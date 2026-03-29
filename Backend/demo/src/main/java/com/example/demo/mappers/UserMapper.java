package com.example.demo.mappers;

import com.example.demo.dtos.UserDTO;
import com.example.demo.models.Role;
import com.example.demo.models.User;
import org.springframework.stereotype.Component;


@Component

public class UserMapper {

    // Transformer l'entité en DTO (Pour envoyer vers Angular)
    public static UserDTO toDTO(User user) {
        if (user == null) return null;

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name()); // transforme un Enum ROLE_STUDENT EN "ROLE_STUDENT"
        // pase password

        return dto;

    }

    public static User toEntity(UserDTO dto)
    {
        if (dto == null) return null;

        User user = new User();
        user.setId(dto.getId());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setRole(Role.valueOf(dto.getRole())); //transforme le texte en objet Enum

        // ATTENTION : Le mot de passe ne vient pas du DTO !
        // Il sera géré à part lors de l'inscription pour être crypté.

        return user;

    }
}


//
//toDTO : C'est pour la Lecture (MySQL ➡️ Angular). On "nettoie" les données.
//
//toEntity : C'est pour l'Écriture (Angular ➡️ MySQL). On "prépare" les données pour le stockage permanent.