package com.example.demo.dtos;

import lombok.Data;

import java.util.List;

@Data
public class CourseDTO {
    private Long id;
    private String title;
    private String description;
    private String authorName; // "Amos" au lieu de l'objet complet
    private Long authorId;     // Utile pour les liens
    private List<SectionDTO> sections;
}
