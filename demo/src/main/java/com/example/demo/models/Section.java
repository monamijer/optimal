package com.example.demo.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name ="sections")
@Data
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

    @Column(nullable = false)
    private  String titre;

    //L'annotation @Lob
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private  String content;

    private int orderIndex;

    @ManyToOne
    @JoinColumn(name = "course_id",nullable = false)
    private Course course;
}
