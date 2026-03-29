package com.example.demo.controllers;

import com.example.demo.dtos.CourseDTO;
import com.example.demo.dtos.SectionDTO;
import com.example.demo.dtos.UserDTO;
import com.example.demo.services.CourseService;
import com.example.demo.services.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")

public class SectionController {
    private final SectionService sectionService;


    //recuperer toutes les sections d'un cours precis

    @GetMapping("/course/{courseId}")
    public List<SectionDTO> getSectionsByCourse(@PathVariable Long courseId) {
        return sectionService.getSectionsByCourseId(courseId);
    }

    @PostMapping
    public SectionDTO create(@RequestBody SectionDTO dto) {
        return sectionService.saveSection(dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        sectionService.deleteSection(id);
    }

}
