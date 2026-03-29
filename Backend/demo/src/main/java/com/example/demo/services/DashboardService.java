package com.example.demo.services;

import com.example.demo.dtos.DashboardStatsDTO;
import com.example.demo.repositories.CourseRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final UserRepository userRepository;
    private  final CourseRepository courseRepository;

    public DashboardStatsDTO getAdminStats(){
        long students = userRepository.countByRole("ROLE_STUDENT");
        long teachers = userRepository.countByRole("ROLE_TEACHER");
        long courses = courseRepository.count();

        //on construit le dto avec le builder de Lambok

        return DashboardStatsDTO.builder()
                .totalStudent(students)
                .totalCourses(courses)
                .totalTeachers(teachers)
                .build();
    }
}
