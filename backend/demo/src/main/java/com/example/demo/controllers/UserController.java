package com.example.demo.controllers;

import com.example.demo.dtos.SectionDTO;
import com.example.demo.services.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.PublicKey;
import java.util.List;

@RestController // dis au navigateur que lesd= donnes qu'il va recevoir sont des donnees brut
@RequestMapping("/api/sections") // la route
@RequiredArgsConstructor // genere un constructeurr automatique
@CrossOrigin(origins = "http://localhost:4200") // permet la communication entre Angular et Spring (mmunication entre 2 serveurs )

public class UserController {
    private final SectionService sectionService;

    //recuperer toutes les sections d'un cours precis
    @GetMapping("/course/{courseId}")
    public List<SectionDTO> getByCourse(@PathVariable Long courseId){
        return sectionService.getSectionByCourse(courseId);
    }

    //Creer une nouvelle section(via le formulaire prof)
    @PostMapping
    public  SectionDTO create(@RequestBody SectionDTO dto){
        return sectionService.saveSection(dto);
    }
}