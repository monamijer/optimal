package com.example.demo.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EnrollmentDTO {

    private Long id;
    private Long studentID;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime enrollmentDate;
    private int progress;
    private String status;

}
