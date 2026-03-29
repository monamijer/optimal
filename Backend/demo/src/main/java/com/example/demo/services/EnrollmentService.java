package com.example.demo.services;

import com.example.demo.dtos.EnrollmentDTO;
import com.example.demo.mappers.EnrollmentMapper;
import com.example.demo.models.Course;
import com.example.demo.models.Enrollment;
import com.example.demo.models.User;
import com.example.demo.repositories.CourseRepository;
import com.example.demo.repositories.EnrollmentRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;

import java.text.Collator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseService courseService;
    private final EnrollmentMapper enrollmentMapper;
    private final CourseRepository courseRepository;

    @Transactional
    public EnrollmentDTO enrollStudent(Long studentId, Long courseId) {

        // 1. Vérifier si l'étudiant est déjà inscrit
        if (enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId).isPresent()) {
            throw new RuntimeException("L'étudiant est déjà inscrit à ce cours.");
        }

        // 2. Récupérer les entités
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 3. Créer l'inscription
        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);

        return enrollmentMapper.toDTO(enrollmentRepository.save(enrollment));
    }

    public List<EnrollmentDTO> getStudentEnrollment(Long studentId){
        return enrollmentRepository.findStudentById((studentId))
                .stream()
                .map(enrollmentMapper::toDTO)
                .collect(Collectors.toList());
    }
}
