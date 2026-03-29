package com.example.demo.models;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Entity
@Table(name = "enrollment")
@Data
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "course_i",nullable = false)
    private Course course;

    private LocalDateTime enrollmentDate = LocalDateTime.now();

    private int progress = 0; //Pourcentage de progression

    @Column(nullable = false)
    private  String status = "ACTIVE"; // ACTIVE, COMPLETED, CANCELED
}
