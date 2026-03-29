package com.example.demo.mappers;

import com.example.demo.dtos.EnrollmentDTO;
import com.example.demo.models.Enrollment;
import com.example.demo.repositories.CourseRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.persistence.Column;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor

public class EnrollmentMapper {
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    // 1. Transformer l'Entité (MySQL) en DTO (Angular)
    public EnrollmentDTO toDTO(Enrollment enrollment) {
        if (enrollment == null) return null;

        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setId(enrollment.getId());
        dto.setEnrollmentDate(enrollment.getEnrollmentDate());
        dto.setProgress(enrollment.getProgress());
        dto.setStatus(enrollment.getStatus());

        // Extraction des infos de l'étudiant
        if (enrollment.getStudent() != null) {
            dto.setStudentID((enrollment.getStudent().getId()));
            dto.setStudentName(enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName());
        }

        // Extraction des infos du cours
        if (enrollment.getCourse() != null) {
            dto.setCourseId(enrollment.getCourse().getId());
            dto.setCourseTitle(enrollment.getCourse().getTitle());
        }

        return dto;
    }

    // 2. Transformer le DTO (Angular) en Entité (MySQL)
    public Enrollment toEntity(EnrollmentDTO dto) {
        if (dto == null) return null;

        Enrollment enrollment = new Enrollment();
        enrollment.setId(dto.getId());
        enrollment.setProgress(dto.getProgress());
        enrollment.setStatus(dto.getStatus());

        // On ne touche pas à la date ici car elle est gérée par l'entité par défaut

        // On va chercher l'étudiant réel dans la DB via son ID
        if (dto.getStudentID() != null) {
            enrollment.setStudent(userRepository.findById(dto.getStudentID()).orElse(null));
        }

        // On va chercher le cours réel dans la DB via son ID
        if (dto.getCourseId() != null) {
            enrollment.setCourse(courseRepository.findById(dto.getCourseId()).orElse(null));
        }

        return enrollment;
    }
}
