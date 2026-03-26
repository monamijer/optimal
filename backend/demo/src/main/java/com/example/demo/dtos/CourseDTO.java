package com.example.demo.dtos;

import lombok.Data;

@Data
public class CourseDTO {
    private Long id;
    private String title;
    private  String description;
    private String authorFullName; // on combine le nom et le prenom de USER
    // On ne met pas la liste des sections ici pour la liste generale
}
