package com.example.demo.repositories;

import com.example.demo.models.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository  extends JpaRepository<Enrollment,Long> {
    // trouver toutes les inscription d'un etudiant
    List<Enrollment> findStudentById(Long studentId);

    //touver toutes les inscriptions pour un cours
    List<Enrollment> findByCourseId(Long courseId);

    //verifier si un etudiant ets deja inscrit
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);



}

