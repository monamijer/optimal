package com.example.demo.mappers;

import com.example.demo.dtos.SectionDTO;
import com.example.demo.models.Section;
import org.springframework.stereotype.Component;

@Component
public class SectionMapper {
    // Transformer l'Entity (Base de données) en DTO (Frontend)
    public static SectionDTO toDTO(Section section){
        if (section == null) return null;

        SectionDTO dto = new SectionDTO();
        dto.setId(section.getId());
        dto.setTitle(section.getContent());
        dto.setContent(section.getContent());
        dto.setOrderIndex(section.getOrderIndex());

        // on recupere juste l'Id du cours parent
        if (section.getCourse() != null){
            dto.setCourseId(section.getCourse().getId());
        }
        return dto;
    }

    // l'inverse
    public static Section toEntity(SectionDTO dto) {
        if (dto == null) return null;

        Section section = new Section();
        section.setId(dto.getId());
        section.setTitre(dto.getTitle());
        section.setContent(dto.getContent()); // Le Markdown repart vers MySQL
        section.setOrderIndex(dto.getOrderIndex());

        return section;
    }
}

//
//toDTO : C'est pour la Lecture (MySQL ➡️ Angular). On "nettoie" les données.
//
//toEntity : C'est pour l'Écriture (Angular ➡️ MySQL). On "prépare" les données pour le stockage permanent.