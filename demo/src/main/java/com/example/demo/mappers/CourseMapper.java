package com.example.demo.mappers;

import com.example.demo.dtos.CourseDTO;
import com.example.demo.models.Course;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {
    // Transformer l'Entity (Base de données) en DTO (Frontend)
    public static CourseDTO toDTO(Course course) {
        if (course == null) return null;

        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());

        // Magie de l'aplatissement : on combine nom et prénom de l'auteur
        if (course.getAuthor() != null) {
            String fullName = course.getAuthor().getFirstName() + " " + course.getAuthor().getLastName();
            dto.setAuthorFullName(fullName);
        }

        return dto;
    }

    // Faire l'inverse : Transformer le DTO (reçu d'Angular) en Entity (pour MySQL)
    public static Course toEntity(CourseDTO dto) {
        if (dto == null) return null;

        Course course = new Course();
        course.setId(dto.getId());
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());

        return course;
    }
}
//
//toDTO : C'est pour la Lecture (MySQL ➡️ Angular). On "nettoie" les données.
//
//toEntity : C'est pour l'Écriture (Angular ➡️ MySQL). On "prépare" les données pour le stockage permanent.