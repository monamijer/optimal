package com.example.demo.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalStudent;
    private long totalTeachers;
    private long totalCourses;
    private double averageStudentsPerCourse; /// pour le future
}
