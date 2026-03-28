package com.example.demo.controllers;

import com.example.demo.dtos.CourseDTO;
import com.example.demo.services.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")

public class SectionController {
    private final CourseService courseService;

    @GetMapping
    public List<CourseDTO> getAll(){
        return courseService.getAll();
    }

    @GetMapping("/{id}")
    public CourseDTO getOne(@PathVariable Long id){
        return courseService.getCourseById(id) ;
    }
}
