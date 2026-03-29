package com.example.demo.models;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity // Dit à Java : "Ceci est une table MySQL"
@Table(name = "courses") // Donne le nom 'courses' à la table
@Data // Génère automatiquement les Getters et Setters (grâce à Lombok)

public class Course {

        @Id // Dit que c'est la clé primaire
        @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incrément (1, 2, 3...)
        private Long id;

        @Column(nullable = false) // Le titre ne peut pas être vide
        private String title;

        @Column(columnDefinition = "TEXT") // Pour pouvoir écrire une longue description
        private String description;

        @ManyToOne
        @JoinColumn(name = "author_id")
        private User author;

        @OneToMany(mappedBy = "course",cascade = CascadeType.ALL)
        private List<Section> sections;
}
