package com.example.demo.controllers;

import com.example.demo.dtos.CourseDTO;
import com.example.demo.services.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")// Indispensable pour Angular

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

    //creer un cours
    @PostMapping
    public Course createCourse(@RequestBody CourseDTO courseDto) {
        return courseService.save(courseDto); // Enregistre dans MySQL
    }

    //update course
    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable Long id, @RequestBody CourseDTO courseDto) {
        return courseService.update(id, courseDto);
    }

    //search
    @GetMapping("/search")
    public List<Course> search(@RequestParam String keyword) {
        return courseRepository.findByTitleContaining(keyword);
    }
}
