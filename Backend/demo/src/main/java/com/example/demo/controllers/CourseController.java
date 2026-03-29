package com.example.demo.controllers;

import com.example.demo.dtos.CourseDTO;
import com.example.demo.services.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "httl://localhost:4200")// Indispensable pour Angular

public class CourseController {
    private final CourseService courseService;

    @GetMapping
    public List<CourseDTO> getAll(){

        return  courseService.getAll();
    }

    @GetMapping("/{id}")
    public CourseDTO getOne(@PathVariable Long id) {
        return courseService.getCourseById(id);
    }


    // Dans CourseController.java
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        courseService.deleteCourse(id);
    }
}
