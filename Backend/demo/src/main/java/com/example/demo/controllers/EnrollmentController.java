package com.example.demo.controllers;

import com.example.demo.dtos.EnrollmentDTO;
import com.example.demo.models.Enrollment;
import com.example.demo.services.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost")

public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    // 1. Inscrire un étudiant à un cours
    // On passe le studentId et le courseId dans l'URL ou via un DTO

    public ResponseEntity<EnrollmentDTO> enroll(@RequestParam Long studentId,@RequestParam Long courseId){
        EnrollmentDTO enrollment = enrollmentService.enrollStudent(studentId,courseId);
        return ResponseEntity.ok(enrollment);
    }

    // recuperer tout les cours d'un etudiant

    @GetMapping("/student/{student}")
    public ResponseEntity<List<EnrollmentDTO>> getStudentCourses(@PathVariable Long studentId){
        List<EnrollmentDTO> enrollments = enrollmentService.getStudentEnrollment(studentId);
        return ResponseEntity.ok(enrollments);
    }

    //mettre a jour la pression

    @PatchMapping("/{id}/progress")
    public ResponseEntity<Void> updateProgress(@PathVariable Long id, @RequestParam int progress) {

        return ResponseEntity.noContent().build();
    }
}
